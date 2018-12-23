## Prerequisites

- `git`
- `node.js` v11.4.0 (preferred) or up

## Install

```bash
cd ~
git clone https://github.com/uniqpath/dmt .dmt
cd .dmt
./install full
```

## Verify

```bash
dmt version
```

or just

```bash
dmt
```

## Troubleshooting

- if it doesn't work (unknown command), try closing terminal tab or logout / log back in in case of ssh session.
- also make sure you have something like this:

```bash
# Alias definitions.
if [ -f ~/.bash_aliases ]; then
  . ~/.bash_aliases
fi
```

in `.bashrc`, `.profile` or `.bash_profile`.

## Start the daemon(s)

```
dmt start
```

## Verify

Check if the daemons are actually running and observe the log:

```
dmt log
```
