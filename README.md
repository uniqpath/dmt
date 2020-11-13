<img src="help/img/dmt_banner.jpg">

## Try DMT locally

Clone the repo:
```
git clone https://github.com/uniqpath/dmt.git ~/.dmt
```

Run dmt-proc in terminal foreground
```
cd ~/.dmt/core/node/controller/daemons
node --experimental-modules --experimental-specifier-resolution=node --unhandled-rejections=strict dmt-proc.js
```

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-run.png?raw=true">

# Prerequisites:

`node.js >= 14.0.0`

Install with [n](https://github.com/tj/n) (recommended).

Like this:

```
curl -L https://git.io/n-install | bash
```

## dmt-proc

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-proc.jpg?raw=true">

### Daemonize the process

One time preparation:
```
cd ~/.dmt
./install
source ~/.dmt/shell/.loader
```

Start daemonized
```
dmt start
```

## DMT-GUI

[http://localhost:7777](http://localhost:7777)

## Read help

It's written well, please read.

```
dmt help
```

### A few interesting commands:

See all other dmt-processes on your LAN:
```
dmt nearby
```


See `dmt-proc` in-memory state:
```
dmt state
```

See incoming and outgoing `fiber connections` (try opening `http://localhost:7777` first):
```
dmt connections
```

## Visit the Website to always learn more

[dmt-system.com](https://dmt-system.com) 💡🚀🎸 (built with **[Svelte](https://svelte.dev) + [Connectome](https://github.com/uniqpath/connectome)**)

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_research_space.jpg?raw=true">
