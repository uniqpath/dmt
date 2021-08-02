<img src="https://github.com/uniqpath/info/blob/master/assets/img/uniqpath_dmt_engine_banner.png?raw=true">

## GET DMT

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt
cd ~/.dmt
./install
source ~/.dmt/shell/.loader
```

`./install` will enable `dmt` command by adding one line to `~/.bash_profile`.

## Documentation

- [Beginner's Guide](https://docs.uniqpath.com/dmt)
- [DMT SYSTEM](https://dmt-system.com)
- [Help directory in this repo](https://github.com/uniqpath/dmt/tree/main/help)
- [uniqpath/info repo](https://github.com/uniqpath/info)

Look around, information is in many places, but not too many.

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
cd ~/.dmt/core/node/controller/processes
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
