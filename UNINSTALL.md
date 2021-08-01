## UNINSTALL 🗑️

1. Directories

You can get rid of everything with `rm -rf ~/.dmt` and `rm -rf ~/.dmt-here`.

Take some extra care if you added some custom configuration in your `~/.dmt/user` dir and/or if there are important files living in `~/.dmt-here` directory. `~/.dmt-here` is utilized through advanced usage of DMT ENGINE and is initially mostly empty.

2. Shell loader

One line in `~/.bash_profile` can remain:

```bash
if [ -f ~/.dmt/shell/.loader ]; then . ~/.dmt/shell/.loader; fi # Added by dmt-system (see https://github.com/uniqpath/dmt)
```

It is not active in any way without the `~/.dmt` directory.

You can also remove it manually if you want: look into `~/.bash_profile` or `~/.bashrc` or `~/.zshrc`.
