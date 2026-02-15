<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-system-meta.png?raw=true">

## Project background

**DMT SYSTEM** is a flexible, early adopters framework for making your life better and easier. We do this by telling computers what to do for us. Each computer runs a customized **dmt process** and executes needed tasks every second of every day so we don't have to. Our brains want Big Picture, not technical details.

# SERVER SETUP (part TWO)

If you want to start with your local device (Personal Computer), [FOLLOW PART ONE](./SETUP_DEVICE.md) first.

You can then continue with this guide. Any order actually works, depending on your preferences and priorities.

🔎 Here is one example of such [Zeta node](https://zetaseek.com). There are others as well. Visit [DMT SYSTEM](https://dmt-system.com) website for some more background info.

**DMT Search** is one of the main apps running on DMT SYSTEM. Zeta nodes expose this search interface by default.

Installation takes around ⏱️**10 min** in optimal scenario and a few minutes more if you're doing it for the first time.

### Prerequisites

**Get a fresh** Debian/Ubuntu linux server (from [DigitalOcean](https://www.digitalocean.com/)?) and ⚙️ [SET IT UP](./SETUP_SERVER.md) (⏱️ **5 min**)

---

### Login to your server

Now login to your **⚡new remote computer⚡** with your *non-root username*:

```bash
ssh user@ip
```

 continue with setup:

```bash
sudo apt update
sudo apt install -y git
```

### Get DMT ENGINE

⏱️ **2 min**

This is the 🚂 **engine** that runs our node and connects to other network nodes.

Install (everything stays neatly inside the `~/.dmt` directory):

```bash
git clone https://github.com/uniqpath/dmt.git ~/.dmt
cd ~/.dmt && ./install
source ~/.bashrc
```

(ignore the `node.js is not installed` message for now).

### Automatic setup

⏱️ **3 min**

```bash
dmt_setup_server
```

Remember to logout and login if you get this error: `setup_dmt_server: command not found`.

The correct **welcome screen** indicating that the script is ready to run looks like this:

![zeta_setup](./img/zeta_setup.png)

✨**That's it**, follow the instructions on screen 👣 🐇. A few minutes later:

<p align="center"><img src="./img/rabbit_easy.png" width="400px"></p>

### ✓ Now you have a successful install 🎉

You should now be able to open `http://server_ip:7777/dmt-search`.

### Configure timezone on the server

Set it to the same zone as your local computer.


See available timezones:
```bash
timedatectl list-timezones | grep Europe
```

Set the timezone:
```bash
sudo timedatectl set-timezone Europe/Paris
```

Check that it worked:

```bash
timedatectl
```

You should see "Time zone: Europe/Paris (CET, +0100)".

## Install and setup Caddy server

[Caddy server](https://caddyserver.com/) servers your dmt and other apps and manages https certificates automatically.

```bash
dmt get caddy
```

```bash
cd /etc/caddy
sudo cp Caddyfile Caddyfile2
sudo cp ~/.dmt/etc/conf/caddy/Caddyfile .
```

Edit Caddyfile with:

```bash
dmt config caddy
```

Replace `yourdomain.com` with your domain. Don't forget to point your domain to your server IP address in your DNS.

```
srv caddy reload
```

(srv is convenient shortcut for systemctl services management)

Check if visiting yourdomain opens dmt search app on the server.

# Support info

💡To manually update `~/.dmt` to new version in the future use: `dmt next`.

See the autoupdate status with `dmt autoupdate` command. It is recommented to keep this enabled.

**Happy explorations!**

Curiosity is the engine of progress.

## More resources

[DMT ENGINE Documentation](https://docs.uniqpath.com/dmt) with explanation of core ideas and concepts.
