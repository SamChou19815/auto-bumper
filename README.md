# auto-bumper

Run `yarn bump` to automatically bump your pre-defined list of dependencies.

The action will first run `yarn` to install your dependencies and run `yarn bump` to bump your
dependencies. Then it will create a pull request with the changes.

You can actually do whatever you want in your `yarn bump` script. You can choose to bump all of
your dependencies or only a subset of them.

## Usage

```yml
name: Bump
on: pull_request

jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
        with:
          token: ${{ secrets.BOT_TOKEN }}
      - uses: SamChou19815/auto-bumper@master
        env:
          BOT_TOKEN: '${{ secrets.BOT_TOKEN }}'
          # Optional
          MAIN_BRANCH: main
          NEW_BRANCH: dev-sam-auto-bumper
          COMMIT_MESSAGE: '[bot] Automatically bump dependencies'
```
