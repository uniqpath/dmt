# Further setup

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_banner.png?raw=true">

**Linux** (Debian, Raspbian etc.) / **macOS** / **Windows 10 Ubuntu shell**:

### Search content setup

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
