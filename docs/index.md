Reasons to exist:

- To serve as a stable playground for developing easy to install, update and share p2p, IoT and other modular software.
- To equalize the command line between Linux and macOS devices, including servers and single board computers.
- To equalize the command line (and broader functionality via packages) between all your PC / IoT machines.
- To optimize for efficiency: maximum amount of functionality / impact for minimum amount of typing / thinking.

## Design goals:

- Very easy install and clean removal.
- Small initial download size.
- Once installed on one of your machines, it can spread "like a virus" to all the others (only on your request, technically impossible otherwise).
- Integrity and safety (no hidden traps).
- Commands with as little keystrokes as possible - you can most of the time type just a few letters of the command and command line will know exactly what you ment. This is useful, but especially useful when controlling one or more of your machines from a mobile phone.

## Docs

- This document, more on the way.
- `dmt docs` command after install.
- You could also browse the source code, it is reassuring to know nothing is hidden and you can always take a look.
- Bash just looks cryptic but is very simple, that is its main goal.

## One-line install

    curl -L https://uniqpath.com/dmt-install | bash

## What just happened?

- Zip file was downloaded (from https://uniqpath.com/repo/dmt.zip, as specified in the curled script).
- This file was unpacked to newly created directory `~/.dmt`, then deleted.

You now have all the code on your machine but it is not active yet.

What follows is activation which is unobtrusive (you don't notice the changes if you don't want to and you notice them as much as you take time to investigate and learn about them):

- Special file `~/.dmt/shell/.bash_aliases-production-readonly` which is just all the files with important scripts concatenated together was generated.
- This special file is then symlinked to `~/.bash_aliases` (if you already had this file, backup is created).

You have to make sure your `~/.bash_aliases` is actually included from `.bashrc`, `.bash_profile` or `.profile`, like this:

```
# Alias definitions.
if [ -f ~/.bash_aliases ]; then
 . ~/.bash_aliases
fi
```

This is true by default on most systems, so it should just work. Try:

`dmt`

Now you have a working system, **that is already a lot**! Congratulations!

Now try:

`dmt update`

or just:

`update`

This brings you the latest changes from the same .zip file you just downloaded. There probably won't be anything new in such a short time, but it usually is every few weeks. Our other most important design goals are:

- It should just work, with very minimum amount of breakage and all problems should be fixed reliably.
- **No known bugs**, if you find any, we will fix them at no cost if the bug can easily be reproduced (and it should because bash is very standard and almost equal between all the machines running it).
- The scripts should mostly work in 30 or more years with no changes, that's why we chose bash, which is very stable and doesn't (can't) change much or at all.
- Bash scripts _are real programs_.
- We also look at bash scripts as gateways to other more complex programs in other frameworks like `node.js`, `rust` or similar, such packages live in `~/.dmt/packages`. Install system for these is not yet fully done.

To learn a few basic commands that will save you time, please try:

## Help

    dmt help

To see some examples of commands:

    dmt docs

## Spread it like a virus

Every useful piece of code should have an easy way to replicate itself, try:

    dmt update pi@raspberry.local

if you have one of the RaspberryPy computers with default settings on your network. Now it too has a copy of `.dmt` framework installed.

Furthermore, if you create `~/.dmt/user/networks.def` file which looks similar to this:

    network: home
      gatewayMac: 52:38:a4:cc:f7:30

      mpdPlayer:
        host: player.local
        type: forked-daapd
        outputs: Kitchen, Lab, LivingRoom, Outside

      devices:
        domain: .local
          user: eclipse
            devices: solar
          user: pi
            devices: kitchen, lab, living-room, outside

    network: office
      gatewayMac: 12:28:e4:dd:f7:80

      mpdPlayer: elm
        host: elm.local

      devices:
        domain: .local
          user: pi
            devices: elm

`gatewayMac` is the hardware mac address of your router (gateway). In this way *.dmt framework* can be context-aware regarding to your physical location (without any privacy intrusion possible at all), so that when you say:

    dmt update all

it will update all your nearby devices (`.local` is a dynamic zero config dns system usually proveded by `avahi` on linux and `bonjour` on macOS) updated.

You can get your `gatewayMac` right now if you have installed `.dmt` by typing:

    gatewayMac

Some command like `m` (stands for "music") will also know where to look for a *mpd-compatible player* on your current network (defined in `mpdPlayer` settigs).

One more thing...

As you noticed, you have created `user` directory to hold you `networks.def` file. You can also add the `bash` subdir which will get included on all your devices automatically. So this is a way to integrate your own bash magic (haven't you always wished for this?) into the "viral load".

## How to uninstall:

    dmt uninstall

Now you got rid of the effects of everything you installed in the first step! Symlink from your `~/.bash_aliases` was removed and that's all it had to be done.

To even remove the (now inefective) code from your storage media, just type `rm -rf ~/.dmt`.

Now you got rid of everything (execution as well as storage space occupied) that you installed a few _minutes ago_.

