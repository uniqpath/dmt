<img src="https://github.com/uniqpath/info/blob/master/assets/img/uniqpath_dmt_engine_banner.png?raw=true">

## GET DMT

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt
cd ~/.dmt
./install
source ~/.dmt/shell/.loader
```

`./install` will enable `dmt` command by adding one line to `~/.bash_profile`.

## Background

**DMT ENGINE** Does Many Things well, especially Partially Connected Networks. 

[Developer portal](https://dmt-system.com) is in development👷

## About

DMT ENGINE / DMT SYSTEM are still evolving but already serving their purpose very well in many use cases.

🐠 And welcome onboard, onwards!

## Useful things you can already experiment with

1. Run your own search node or two: [instructions here](./help/TRY_DMT_SEARCH.md).

2. Play with novel [CRDT constructs](https://github.com/dmtsys/crdt_yjs).

<img src="./help/img/dmt_search_engine.png" alt="dmt search engine" />

Andrew Leonard beautifully puts it like this: <i>“Computers, like psychedelic drugs, are tools for mind expansion, for revelation and for personal discovery. And to anyone who has experienced a drug-induced epiphany, there may indeed be a cosmic hyperlink there: fire up your laptop, connect wirelessly to the Internet, and search for your dreams: the power and the glory of the computing universe that exists now… does pulsate with a destabilizing, revelatory psychic power.”</i>

## Requirements

**Linux** (Debian, Raspbian etc.) / **macOS** / **Windows 10 Ubuntu shell**:

`node.js >= 15.0.0`

You can install `node.js` via [n](https://github.com/tj/n) which makes upgrading node.js easier. Install `n`:

```
curl -L https://git.io/n-install | bash
```

Then use command:

```bash
n
```

to manage `node.js` versions.

## Help

```
dmt help
```

## RUN DMT

💡 **The greatest hit!**

Test by running the process in terminal foreground:

```
dmt run
```

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-run.png?raw=true">

This is equivalent to:

```
cd ~/.dmt/core/node/controller/daemons
node --experimental-modules --experimental-specifier-resolution=node --unhandled-rejections=strict dmt-proc.js
```

When we are actually in the future it will just be `node dmt-proc.js`.

With `dmt run` you're there already... and it works from any directory. So just use that :)

## Run in background

Start the process *daemonized* (running in background, not within one terminal window):

```
dmt start
```

Stop it with:

```
dmt stop
```

## UNINSTALL 🗑️

[Uninstall](./UNINSTALL.md)

## More

[More](./MORE.md)

<img src="https://github.com/uniqpath/info/blob/master/assets/img/uniqpath_banner.png?raw=true">
