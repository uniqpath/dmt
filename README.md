<img src="https://github.com/uniqpath/info/blob/master/assets/img/uniqpath_banner.png?raw=true">

<img src="https://github.com/uniqpath/info/blob/master/assets/img/uniqpath_dmt_engine_banner.png?raw=true">

![dmt_device_types](https://github.com/uniqpath/info/blob/master/assets/img/dmt_device_types.png?raw=true)

## See the presentations

Here are the presentations about [DMT ENGINE, Connectome and Zeta* suite of apps](https://zetaseek.com/?place=2f686f6d652f7a6574612f46696c65732f444d542d53595354454d2f50726573656e746174696f6e73).

![my_connectome](https://github.com/uniqpath/info/blob/master/assets/img/my_connectome.png?raw=true)

This capability is coming in Q1 or Q2 2020 but you are welcome to provide input and even co-design it!

💡 Visit one of our [informal discussion meetups](https://dmt-system.com) when they are announced. This is usually a good time-investment.

![dmt_meetup](https://github.com/uniqpath/info/blob/master/assets/img/dmt_meetup.jpg?raw=true)

## Try uniqpath DMT ENGINE today

Option 1 — **Personal Computer** (see [info](https://github.com/uniqpath/info) for information on server and single-board computer setup):

**Begin by** cloning the repo:

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt
```

Run dmt-proc in terminal foreground
```
cd ~/.dmt/core/node/controller/daemons
node --experimental-modules --experimental-specifier-resolution=node --unhandled-rejections=strict dmt-proc.js
```

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-run.png?raw=true">

If you are disappointed you can get rid of it by simple `rm -rf ~/.dmt` (be careful only if you added some custom configuration in your `~/.dmt/user` dir)

# Prerequisites:

**Linux** (Debian, Raspbian etc.) / **macOS** / **Windows 10 Ubuntu shell**:

`node.js >= 14.0.0`

Install with [n](https://github.com/tj/n) (recommended).

Like this:

```
curl -L https://git.io/n-install | bash
```

# Install

Install is nothing more than enabling a `dmt` shell command which is a shortcut to what you wrote when trying out the engine. It also provides some other nice command line features but mostly there is no concept of "installation" here. You always have this one directory (`~/.dmt`) and whenever you want you start the **dmt process** based on source code in this directory.

```
cd ~/.dmt
./install
source ~/.dmt/shell/.loader
```

Start the process again, this time *daemonized* (running in background, not within one terminal window):
```
dmt start
```

## DMT-GUI

[http://localhost:7777](http://localhost:7777)

This is "the zeroth" app on top of DMT ENGINE. **DMT Seek** is the app #1, **DMT Draw** will be #2.

One public example of **DMT Seek** node running in production is [ZetaSeek](https://zetaseek.com).

## Read basic cli help

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

See incoming and outgoing [Connectome](https://github.com/uniqpath/connectome) connections ` (try opening `http://localhost:7777` first):
```
dmt connections
```

## Alternative dmtSource

There is an equivalent version available from [get-dmt.com](http://get-dmt.com) (one line install `curl get-dmt.com | bash`).

### Updating

If you installed from github, you can just `git pull` to get the new version.

If you ran `./install` and you have `dmt` command available, then you can use `dmt next` to get the next relase (from github as well as get-dmt.com).

```bash
$ dmt next

dmtSource: get-dmt.com

Current version : 1.1.91 · 2020-11-06
Next version    : 1.1.94 · 2020-11-13

Do you want to update? …
```

get-dmt.com is not on https currently because of reliability issues with `curl` trying to access some sites with modern https certificates (Let's Encrypt).

We will work on some other ways of getting the code reliably by using digital signatures for actual files received instead of `https` certificates.

## DMT ENGINE on servers and Single Board Computers

- Create a [personal (search) node](https://github.com/uniqpath/dmt/blob/main/help/ZEN_NODE.md) on public IP (personal server instance)
- [Install on your Single Board Computer](https://github.com/uniqpath/info/blob/master/assets/pdf/rpi_guide.pdf) like [RaspberryPi 3B+](https://github.com/uniqpath/info/blob/master/hardware/README.md)

Please reach out for further instructions (visit our DMT / Zeta Open Hours published via [dmt-system.com](https://dmt-system.com) or contact us on [Discord support](https://discord.gg/XvJzmtF)). Server and SBC setup instructions are easy as well but some guidance and context clarification is usually welcome. We will also show you how to use the built-in music player and some other candies!

![dmt_architecture](https://github.com/uniqpath/info/blob/master/assets/img/dmt_architecture2.png?raw=true)

## Read info repository for more resources

There are some more resources listed in [info](https://github.com/uniqpath/info) repository.

More proper technical documentation for **DMT ENGINE** is coming online on (JAN 1 2022) after Connectome v1.0 documentation (JAN 1 2021).

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_banner_quote.png?raw=true">
