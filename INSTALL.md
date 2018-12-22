# DMT SHELL

**Command line** in general is for UNIX people that more or less know what they are doing... GUI was invented later in the history of computing.

## Install

```bash
cd ~
git clone git@github.com:uniqpath/dmt.git .dmt
cd .dmt
./install
```

Try:
```bash
dmt version
```

Example:

```
     ∞ DMT ∞
Liberate yourself.
v1.0.0 ■ 2018-12-22

357 bash functions
in ~/.bash_aliases
```

Troubleshooting:

- if `dmt version` doesn't work, try closing terminal tab or logout / log back in in case of ssh session.
- make sure you have something like this:

```bash
# Alias definitions.
if [ -f ~/.bash_aliases ]; then
  . ~/.bash_aliases
fi
```

in `.bashrc`, `.profile` or `.bash_profile`.

# DMT CORE

## Install

```bash
cd ~/.dmt
git clone git@github.com:uniqpath/dmt-core.git core
```
