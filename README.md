<img src="https://github.com/uniqpath/info/blob/master/assets/img/uniqpath_dmt_engine_banner.png?raw=true">

## Background

**DMT ENGINE** Does Many Things. [Developer portal](https://dmt-system.com) is in development :)👷

## About

It is most likely that you'll benefit from using this code if you heard about it from someone you trust or already know.

Parts of inner workings are not yet solidified or perfectly documented.

DMT ENGINE / DMT SYSTEM are still evolving but already serving their purpose very well in specific use cases.

Read some linked resources accessible through this repo and try stuff, then decide if you want to continue using.

⚠️ This project may be addictive but in a novel way, <i>not bait and hook, then extract</i>. DMT is just different.

🐠 And welcome onboard, onwards!

## Useful things you can already do easily

Run your own search node or two: [instructions here](./help/TRY_DMT_SEARCH.md).

You will need a tiny bit of <i>do-it-yourself mentality</i>.

A little bit of DIY goes a long way. Since you are on GitHub you probably know this.

<img src="./help/img/dmt_search_engine.png" alt="dmt search engine" />

Andrew Leonard beautifully puts it like this: <i>“Computers, like psychedelic drugs, are tools for mind expansion, for revelation and for personal discovery. And to anyone who has experienced a drug-induced epiphany, there may indeed be a cosmic hyperlink there: fire up your laptop, connect wirelessly to the Internet, and search for your dreams: the power and the glory of the computing universe that exists now… does pulsate with a destabilizing, revelatory psychic power.”</i>

This was written 'a long time ago' but is eternal and still very true and inspiring.

Search is never a done thing, it goes deep and is a fundamental human concept.

Some periods see radical evolution of particular concepts. We are in one such period right now.

Many things are getting reinvented and improved. Search is a meta-concept because in addition to being evolved it can track other fast evolving areas to help make sense of everything in times when really useful information is actually scarce.

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

## GET DMT

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt
cd ~/.dmt
./install
source ~/.dmt/shell/.loader
```

`./install` will enable `dmt` command by adding one line to `~/.bash_profile`.

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
