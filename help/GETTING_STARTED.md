# Getting started

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_banner.png?raw=true">

![bttf](https://github.com/uniqpath/info/blob/master/assets/img/bttf.jpg?raw=true)

**Linux** (Debian, Raspbian etc.) / **macOS** / **Windows 10 Ubuntu shell**:

# Short, simple and effective install:

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt; cd ~/.dmt; ./install
```

## Explaining

All files that you get on your computer exist inside just [one directory](https://github.com/uniqpath/info/blob/master/docs/img/dmt-directory-structure.png?raw=true) (`~/.dmt`).

Apart from that, there is just **one line** added to the end of your `~/.bash_profile`, `~/.bashrc` or `~/.zshrc` file:

```
if [ -f ~/.dmt/shell/.loader ]; then . ~/.dmt/shell/.loader; fi
```

This enables you to use the `dmt` command from anywhere on your system. Examine the [help output](https://github.com/uniqpath/info/blob/master/assets/img/dmt-start/dmt-help.png?raw=true) of this command by typing:

```
dmt
```

Start the [dmt-proc](https://github.com/uniqpath/dmt/blob/master/core/node/dmt-controller/daemons/dmt-proc.js), your new helpful **multi-device** (because you can install it on all you other devices — except mobile phones) agent:

```
dmt startfg
```

You should see this notification on your macOS screen:

![dmt_start_notification](https://github.com/uniqpath/info/blob/master/assets/img/dmt-start/macos-notification.png?raw=true)

Or no notification otherwise (for now) if installing on Linux or Windows 10 (Ubuntu shell).

You should see this log entry being output to the terminal where `dmt startfg` was executed:

![dmt_player](https://github.com/uniqpath/info/blob/master/assets/img/dmt-start/log-entry.png?raw=true)

 start**fg** means **f**ore**g**round. To run `dmt` without having to keep a terminal tab open press `CTRL+C` to terminate the foreground process. Type `dmt start` to start a *background process*. You can still see the log by typing `dmt logfg` (log in the foreground), press CTRL+C to terminate it. To see last few log entries via a "RPC" (remote-procedure-execution) type `dmt log`. This will fetch log entries and then return to the `command line shell` (computing interfaces from the old days before nice GUIs ;)

 To restart the process running in the background you use `dmt restart`.

 This is only needed if you change some definition files inside `~/.dmt/user/devices`.

## Uninstall

First stop `dmt-proc` with `dmt stop` command.

Then all you need is: `rm -rf ~/.dmt` → this removes the entire `~/.dmt` directory without asking.

⚠️ Be careful if you want to preserve your settings and other data inside `~/.dmt/user`.

## Update

`dmt next`

# Dependencies:

Make sure you have these on your system:

## 1.) GIT version management

Decentralized version control.

https://git-scm.com/downloads

You need it to clone this repo to your machine. If you get `dmt-system` by other means, you don't need it.

## 2.) Node.js eventful framework

- node.js > v12.8

Suggested install via https://github.com/tj/n

One command:

`curl -L https://git.io/n-install | bash`

If this fails for some reason (the culprit is your system, not the `n` project), then install node LTS directly from https://nodejs.org/en/

## 3.) MPV light and sound production

- mpv.io (via apt-get, brew)

MPV is responsible for converting digital binary data into sounds and images we can see and hear! Isn't this amazing? The *only problem* is that `mpv` is a command line utility. Something has to *drive it* via a nice GUI. What could that other project be?

![dmt_player](https://github.com/uniqpath/info/blob/master/assets/img/dmt-player-logo.png?raw=true)

### How to install mpv on macOS

You could use `homebrew` as well but in case you cannot or don't want to, here is a more direct way:

1) Visit [https://laboratory.stolendata.net/~djinn/mpv_osx/](https://laboratory.stolendata.net/~djinn/mpv_osx/) (yeah, that's an official link from their site, check https://mpv.io/installation/)

2) Unpack `mpv-0.XX.0.tar.gz`

![mpv_unpack](https://github.com/uniqpath/info/blob/master/assets/img/mpv_guide/unpack_macos.png?raw=true)

And drag `mpv.app` to `/Applications`

![mpv_drag](https://github.com/uniqpath/info/blob/master/assets/img/mpv_guide/macos_applications.png?raw=true)

Then open terminal and create a symlink to `mpv` binary inside `/usr/local/bin`:

`ln -s /Applications/mpv.app/Contents/MacOS/mpv /usr/local/bin/mpv`

![mpv_symlink](https://github.com/uniqpath/info/blob/master/assets/img/mpv_guide/symlink4.png?raw=true)

This will make `mpv` command available from anywhere (because `/usr/local/bin` is *usually* in system's `$PATH`) and `dmt-proc` will easily be able to find it as well.

![mpv_control](https://github.com/uniqpath/info/blob/master/assets/img/mpv_guide/dmt_mpv_control.png?raw=true)

<hr>

### Some further setup

```
$ cd ~/.dmt/user/devices/this/def

$ ls
content.def     device.def

$ nano content.def
```

You should see:

```
content: music
  path: ~/Music
```

Change the second line to specify where your music resides locally on your machine.

You can also add multiple paths, like this:

```
content: music
  path: ~/Music1
  path: ~/Music2
  path: ~/Downloads
```

To indent the lines, strictly use **two spaces**.

After you're done, press `CTRL+O` and `ENTER` to save, then `CTRL+X` to exit `nano` editor.

Then restart dmt by `dmt restart`. You need to restart `dmt-proc` every time device definitions changes.

<hr>

## /player

![mpv_control](https://github.com/uniqpath/info/blob/master/assets/img/screens/screen8.jpg?raw=true)

An example of **dmt-player** setup. Including personal search ala AltaVista circa 1995.

We are of course working on *"Google of personal search"* in our spare time.

## RaspberryPi

![rpi](https://github.com/uniqpath/info/blob/master/assets/img/hardware/rpi-board.jpg)

**SETUP GUIDE**: [rpi_guide.pdf](https://github.com/uniqpath/info/blob/master/assets/pdf/rpi_guide.pdf)

One RPi small computer goes into each pair of speakers. They will find each other on the network automatically and will also show up in the **dmt-player** *nearby devices list* on your computer.

![waveshare](https://github.com/uniqpath/info/raw/master/hardware/img/waveshare_10.1_IPS.jpg)

One RPi computer also goes into each **"Home Controller"**, you build these by obtaining a touch screen as in the [hardware list](https://github.com/uniqpath/info/blob/master/hardware). Then you can control your speakers not only from your computer / laptop but wherever you have **Home Controllers** placed around your house (or even built into walls for proper integration, more info on this in mid 2020).

<hr>

  ♪♫♬ **Music is the weapon, music is the weapon of the future**
  — Fela Kuti
