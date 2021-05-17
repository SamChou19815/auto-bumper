import { spawn, spawnSync } from 'child_process';

const BRANCH = 'dev-sam-auto-bumper';
const COMMIT_MESSAGE = '[bot] Automatically bump dependencies';

import { Octokit } from '@octokit/rest';

const hasChanges = () =>
  spawnSync('git', ['status', '--porcelain'], { stdio: 'pipe', shell: true })
    .stdout.toString()
    .trim() !== '';

const runCommand = (program: string, ...programArguments: readonly string[]) => {
  const programArgumentsQuoted = programArguments
    .map((it) => (it.includes(' ') ? `"${it}"` : it))
    .join(' ');
  console.log(`> ${program} ${programArgumentsQuoted}`);
  const process = spawn(program, programArguments, { stdio: 'inherit' });
  return new Promise<boolean>((resolve) => process.on('exit', (status) => resolve(status === 0)));
};

const main = async () => {
  await runCommand('yarn');
  if (!(await runCommand('yarn', 'bump'))) throw new Error('Failed to bump.');
  if (!hasChanges()) {
    console.error('Nothing to bump!');
    return;
  }
  await runCommand('git', 'add', '.');
  await runCommand('git', 'fetch', '--all');
  await runCommand('git', 'checkout', 'master');
  await runCommand('git', 'checkout', '-b', BRANCH);
  if (await runCommand('git', 'commit', '-m', COMMIT_MESSAGE)) {
    if (await runCommand('git', 'push', '-f', 'origin', BRANCH)) {
      await runCommand('git', 'push', '-f', '--set-upstream', 'origin', BRANCH);
    }
  }
  const octokit = new Octokit({
    auth: `token ${process.env.BOT_TOKEN}`,
    userAgent: 'dev-sam/auto-bumper',
  });
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  if (owner == null || repo == null) throw new Error('Not running in GitHub Actions?');
  const existingPR = (await octokit.pulls.list({ owner, repo, state: 'open' })).data.find(
    (pr) => pr.title === COMMIT_MESSAGE
  );
  if (existingPR == null) {
    await octokit.pulls.create({ owner, repo, title: COMMIT_MESSAGE, base: 'main', head: BRANCH });
  } else {
    await octokit.pulls.update({ owner, repo, pull_number: existingPR.number });
  }
};

main().catch((e) => console.error(e));
