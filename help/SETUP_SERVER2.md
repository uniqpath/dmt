<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-system-meta.png?raw=true">

## Project background

**DMT SYSTEM** is a flexible, early adopters framework for making your life better and easier. We do this by telling computers what to do for us. Each computer runs a customized dmt process and executes needed tasks every second of every day so we don't have to. Our brains want Big Picture, not technical details.

## This is part two of the tutorial (server)

**Or it can be part one as well, it depends!**

If you want to start with your local device (Personal Computer), [FOLLOW PART ONE](./SETUP_DEVICE.md) first.

You can then continue with this guide. Any order actually works, depending on your preferences and priorities.

## Get your own fully independent public Search Node

A `dmt-proc` instance which is publicly accessible (has public IP) is nicknamed **Zeta node**.

🔎 Here is one example of such [Zeta node](https://zetaseek.com). There are others as well. Visit [DMT SYSTEM](https://dmt-system.com) website for some more background info.

**DMT Search** is one of the main apps running on DMT SYSTEM. Zeta nodes expose this search interface by default.

Installation takes around ⏱️**10 min** in optimal scenario and a few minutes more if you're doing it for the first time.

Along the way you learn the basics about **servers**. In near future the smartest people will want to run their own servers for many purposes.

It is not that hard and we help you because we are <i>searching for great people</i> to learn from them as well.

We give you software and knowledge how to set it up, you collect interesting links, decide to share some and we all benefit.

### Prerequisites

**Get a fresh** Debian/Ubuntu linux server** (from [DigitalOcean](https://www.digitalocean.com/)?) and ⚙️ [SET IT UP](./SERVER_SETUP.md) (⏱️ **5 min**)

---

### Login to your server

Now login to your **⚡new remote computer⚡** with your *non-root username*:

```bash
ssh user@ip
```

 continue with setup:

```bash
sudo apt-get update
sudo apt-get -y install git
```

### Get DMT ENGINE

⏱️ **2 min**

This is the 🚂 **engine** that runs our node and connects to other network nodes.

Install (everything stays neatly inside the `~/.dmt` directory):

```bash
git clone https://github.com/uniqpath/dmt.git ~/.dmt
cd ~/.dmt
./install
source ~/.bashrc
```

(ignore the `node.js is not installed` message for now).

### Setup the search node

⏱️ **3 min**

```bash
zeta_setup
```

Remember to logout and login if you get this error: `zeta_setup: command not found`.

The correct **welcome screen** indicating that the script is ready to run looks like this:

![zeta_setup](./img/zeta_setup.png)

✨**That's it**, follow the instructions on screen 👣 🐇. A few minutes later:

<p align="center"><img src="./img/rabbit_easy.png" width="400px"></p>

### ✓ Now you have a successful install 🎉

You should now be able to open `http://server_ip:7777/dmt-search`.

There will be nothing in your search engine though so try this next:

```bash
ssh username@ip

mkdir Files && cd $_

echo "something" > my_test_file.txt
```

And then try entering **test file** search query into the box on your new DMT SEARCH ENGINE.

You will see the test result like this:

<p><img src="./img/test_search_result.png" width="600px"></p>

## What is search engine without links?

Nothing! [FOLLOW THIS GUIDE](./TRY_DMT_SEARCH.md) to set up a **DMT ENGINE** on your personal computer. 

Links are added and scanned from your main (personal machine) and then fully or partially synced to your public DMT ("Zeta") node.

They need to be scanned from residential IP address because big web properties like Amazon and sites behind Cloudflare block scanning from Digital Ocean and other public IPs.

As you will see our search architecture makes for the most private, resillient and useful system for collecting and managing links (and files!).

# Support info

✉️ **Lighttpd webserver setup** (https, zetaseek subdomain, or **your own domain** etc.) docs *available on request*. 

You can use your own domain as well but you'll have to manage `https` certificate separately, of course.

💡👷 We may switch from lighttpd to **nginx** as a default, more powerul static server once some parts of the system are re-architected a bit. In this current setup we cannot generate search link metadata previews for nice sharing of pre-filled search forms in social media. They always display just the default banner and description :( This is a priority for fixing at last by end of this year (2021).

#### ⚠️ Important

Make sure ports `7777` (for GUI) and `7780` (websocket communication port) are not blocked by a firewall.

💡To manually update `~/.dmt` to new version in the future use: `dmt next`.

See the autoupdate status with `dmt autoupdate` command. It is recommented to keep this enabled.

#### 🆘 Support

For any support questions please [Join our Discord server](https://discord.gg/wBpKWepJra).

You can also use hello@uniqpath.com email to contact your decentralized tech support.

**Happy explorations!** Your journey as a <b>Zeta explorer</b> has just started 🤓. Curiosity is the engine of progress.

[DMT SYSTEM](https://dmt-system.com) provides most amazing tools for fully independent or optionally inter-dependent **Search & Discovery**.

## More resources

[DMT ENGINE Documentation](https://docs.uniqpath.com/dmt) with explanation of core ideas and concepts.
