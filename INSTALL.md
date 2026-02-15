<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt-system-meta.png?raw=true">

## Install DMT

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt && cd ~/.dmt
./install && source ~/.dmt/shell/.loader
```

Confirm that it worked:

```
dmt
```

You will see:

```
                ∞ DMT ∞
            Does Many Tricks
         v1.2.131 · 2022-07-01

░░░░░░░░░░░░░▒▒▒▓▓▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░░
░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░░
░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░
░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░
░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░
░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░
░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░
░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
▒▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▒▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
░▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
░▒▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▒░
░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒░░
░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒░░░
░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒░░░░░
░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░
░░░░░░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░░
░░░░░░░░░░░░░▒▒▒▓▓▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░░

       ✖ dmt-proc is not running

          ~ Try dmt start ~
```

💡 If you don't have `node.js` installed, please [follow this](./help/NODEJS.md).

DMT SYSTEM depends on it to function. Bun is a faster and more modern alternative to the legendary **node.js** (still here).
We further depend on many great libraries that come bundled through DMT install. Open source is awesome and powerful.

💡 The entire DMT SYSTEM installation is contained inside one directory — `~/.dmt` and there is also `~/.dmt-here` as well for strictly local information saved only on one device. That's it: two directories, never leaving artefacts around your file system.

## Start the engine

```
dmt start
```

See the new status with 

```
dmt
```

This time it will look something like this (in color):

```
                ∞ DMT ∞
       Digital Mastery Techniques
         v1.2.131 · 2022-07-01

░░░░░░░░░░░░░▒▒▒▓▓▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░░
░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░░
░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░
░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░
░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░
░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░
░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░
░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
▒▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▒▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
░▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
░▒▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▒░
░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒░░
░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒░░░
░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒░░░░░
░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░
░░░░░░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░░
░░░░░░░░░░░░░▒▒▒▓▓▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░░

         ✓ dmt-proc is running
```

To see the log where all important info is shown use this command:

```
dmt log
```

DMT log is stored in `~/.dmt/log/dmt.log` and it auto-truncates to the recent few thousand lines. You don't have to worry about it consuming your disk space over time. DMT SYSTEM takes care of details like this automatically so there is more time for productivity and added value instead of worrying about every last detail of correct setup.

Now stop the process with:

```
dmt stop
```

To get additional help use:

```
dmt help
```

## Indicating mainDevice

Edit device definition file, for example with `nano` editor:

```
nano ~/.dmt/user/devices/this/def/device.def
```

and uncomment `main` key, you can also give your device a custom name:

```
device: dmt-new
  
  # main: true
```

so after editing you have something like:

```
device: eclipse

  main: true
```

Main device is almost the same as any other but it tweaks a few parameters for better experience.

### Running DMT in terminal foreground

You can also spin up `dmt-proc` with:

```
dmt run
```

```
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+13ms) ∞ dmt-proc is starting in terminal foreground …
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+01ms) ∞ OS uptime: 9 days
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+02ms) ∞ Starting content server ...
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+02ms) ∞ 💡 Connectome protocol dmt ready.
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+00ms) ∞ Starting to load dmt-proc modules ...
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+00ms) ∞ Loading player aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+01ms) ∞ Loading search aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+00ms) ∞ Loading notify aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+00ms) ∞ Loading meta/load-app-engines aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+01ms) ∞ Loading gui aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+00ms) ∞ Loading nearby/lanbus aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+00ms) ∞ Loading nearby/nearby aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+01ms) ∞ Loading iot aspect
[run] eclipse 16036 7/2/2022, 1:32:27 PM (+04ms) ∞ 💡 Connectome protocol dmt/gui ready.
...
```

Which can be very helpful, especially when developing on top of the platform. You see the output directly without the need for using `dmt log` and you can restart `dmt-proc` frequently as needed by stopping it with `ctrl+c` and executing `dmt run` again.

This allows you to test the new code faster — things you may have added through "DMT USER ENGINE" or "DMT APPS" extensibility functionality of DMT SYSTEM. 

## DMT GUI

Open DMT GUI at `http://localhost:7777`

This GUI helped us iterate quickly and get us to where we are. Now it is being reworked for the next major version.

## DMT SYSTEM features

For more features, especially when going multi-device please read the [documentation](./DOCS.md) or visit one of our [meetups](https://dmt-system.com/). A lot of functionality is not documented until we test and consolidate it properly.

## Keep up to date

```
dmt next
```

You update DMT ENGINE through this command on your main device.

## Install or update DMT on your other devices

```
dmt update user@ip
```

With this DMT SYSTEM core idea you replicate the global DMT ENGINE that you got from source through install to one or more devices that you own or manage.  Along with core DMT ENGINE you also pass the replica of your private user directory (`~/.dmt/user`) so that your devices can execute your own customized version of the engine reliably and independently.

You can also update all nearby devices with:

```
dmt nearby update
```

Or just use

```
dmt nearby
```

to see what other devices on your local area network are powered by DMT ENGINE.

## Remove DMT

[Uninstall](./UNINSTALL.md)

## More

Please continue [here](./MORE.md).
