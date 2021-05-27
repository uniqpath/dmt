# dmt-player dependency (mpv) install instructions

## Install DMT

`dmt-proc` personal computer [install instructions](https://github.com/uniqpath/dmt).

```
dmt start
```

If you are on macOS, then you should see:

![dmt_start_notification](https://github.com/uniqpath/info/blob/master/assets/img/dmt-start/macos-notification2.png?raw=true)

Or no notification otherwise (for now) if installing on Linux or Windows 10 (Ubuntu shell).

To restart the process running in the background you use `dmt restart`.

## Uninstall

First stop `dmt-proc` with `dmt stop` command.

Then all you need is: `rm -rf ~/.dmt` → this removes the entire `~/.dmt` directory without asking.

⚠️ Be careful if you want to preserve your settings and other data inside `~/.dmt/user`.

## Update

`dmt next`

# Install mpv multimedia player:

- mpv.io (via apt-get, brew)

mpv is a command line player and `dmt-proc` can start it and control it as needed.

### How to install on Single Board Computers like RaspberryPI

Find **RaspberryPi** specific resources [here](https://github.com/uniqpath/info). This is actually the right way ;)

Build your own smart speaker easily, then use `dmt-proc` on your laptop to control other RPi media players on your LAN!

Like this:

![dmt_player](https://github.com/uniqpath/info/blob/master/assets/img/dmt-player/player1.jpg?raw=true)

![dmt_player](https://github.com/uniqpath/info/blob/master/assets/img/dmt-player/player2.jpg?raw=true)

### How to install mpv on macOS

⚠️ Do not use `homebrew` for this! It will take ages to install.

Here is a more direct way:

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

This was tested on macOS Mavericks, High Sierra and Catalina.

## cli control

You can control the player with:

```
dmt media
```

```
[
  'info',     'search',  'play',
  'playUrl',  'pause',   'stop',
  'next',     'volume',  'status',
  'list',     'add',     'insert',
  'insplay',  'similar', 'bump',
  'cut',      'paste',   'forward',
  'backward', 'goto',    'shuffle',
  'limit',    'repeat'
]
```

To edit where `dmt-proc` finds your music:

```
nano ~/.dmt/user/devices/dmt-new/def/content.def
```

You can list all paths like this:

```
content: music
  path: ~/Music
  path: ~/Downloads
  path: ~/Desktop

```

Restart `dmt-proc` after editing this file with `dmt restart`.

Now try `dmt media serch`, you should get a list of files.

You init a new playlist and start playback with:

```
dmt media play [songName]
```

You can also do most of this from `dmt-player` GUI: [http://localhost:7777/player](http://localhost:7777/player).


♪♫♬


## This is not the whole story though

`dmt-player` can play files from your local NAS when you set it up using Samba. Instructions on this soon!

Any device running `dmt-proc` with `dmt-player` GUI can control any player on the network by connecting to it over the `nearbyDevices` list.

Try `dmt nearby` or `dmt state --slot nearbyDevices` to see if you have another `dmt-proc` on your local network ("nearby").

![dmt_player](https://github.com/uniqpath/info/blob/master/assets/img/dmt-player/dmt-player-diagram-1.jpg?raw=true)

![dmt_player](https://github.com/uniqpath/info/blob/master/assets/img/dmt-player/dmt-player-diagram-2.jpg?raw=true)
