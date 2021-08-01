## Documentation

[[[ <a href="./DOCS.md">DOCS</a> ]]]

## DMT-GUI

[http://localhost:7777](http://localhost:7777)


### A few interesting commands:

See all other dmt-processes on your LAN:
```
dmt nearby
```


See `dmt-proc` in-memory state:
```
dmt state
```

See incoming and outgoing [Connectome](https://github.com/uniqpath/connectome) connections (try opening `http://localhost:7777` first):
```
dmt connections
```

### Alternative dmtSource

There is an equivalent version available from [get-dmt.com](http://get-dmt.com) (one line install `curl get-dmt.com | bash`).

## Updating

If you installed from github, you can just `git pull` to get the new version.

If you ran `./install` and you have `dmt` command available, then you can use `dmt next` to get the next relase (from github as well as get-dmt.com).

```bash
$ dmt next

dmtSource: get-dmt.com

Current version : 1.1.91 · 2020-11-06
Next version    : 1.1.94 · 2020-11-13

Do you want to update? …
```

get-dmt.com is not on https currently because of reliability issues with `curl` trying to access some sites with modern https certificates (Let's Encrypt). We will work on some other ways of getting the code reliably by using digital signatures for actual files received instead of `https` certificates.

## DMT ENGINE on servers and Single Board Computers

- Create a [Personal Search Node](./help/ZETA_NODE.md)
- Use as a [Music Player on PC](./help/MPV_SETUP.md)
- [Install on your Single Board Computer](https://github.com/uniqpath/info/blob/master/assets/pdf/rpi_guide.pdf) like [RaspberryPi 3B+](https://github.com/uniqpath/info/blob/master/hardware/README.md)

Please reach out for further instructions (visit our DMT / Zeta Open Hours published via [dmt-system.com](https://dmt-system.com) or contact us on [Discord support](https://discord.gg/wBpKWepJra)). Server and SBC setup instructions are easy as well but some guidance and context clarification is usually welcome. We will also show you how to use the built-in music player and some other things in development!

![dmt_architecture](https://github.com/uniqpath/info/blob/master/assets/img/dmt_architecture2.png?raw=true)

## How DMT ENGINE install works

Install enables `dmt` shell command. It also provides some other nice command line features but mostly there is no concept of "installation" here. You always have this one directory (`~/.dmt`) and whenever you want you start the **dmt process** based on source code in this directory.

## More resources

- [DMT ENGINE Documentation](https://docs.uniqpath.com/dmt)

- [See this info](https://github.com/uniqpath/info) for information on server and single-board computer setup

In addition maybe try searching for <i>DMT SYSTEM</i> on [ZetaSeek.com](https://zetaseek.com/?q=dmt%20system&mode=1) or on [Your Full Local Copy of its Search Index](./help/TRY_DMT_SEARCH.md)

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_banner_quote.png?raw=true">
