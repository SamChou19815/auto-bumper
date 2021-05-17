# auto-bumper

Usage:

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
```
