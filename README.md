<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_banner.png?raw=true">

**Website →** [dmt-system.com](https://dmt-system.com) 💡🚀🎸

## Table of Contents

**Inside this document:**

- [Background and motivation](#background-and-motivation)
- [DMT PROCESS 💡↻](#dmt-process)
- **[Install](#install)** 💡🚀🎸
  - [Update](#update)
  - [Uninstall](#uninstall)
- [Development plans for 2020](#development-plans-for-2020)
- [We are glad to help you get started](#we-are-glad-to-help-you-get-started)
- [License](#license)

## USAGE MANUAL

**Linked documents:**

Basic / practical:

- **[Getting started](help/GETTING_STARTED.md)** 🌀
- [Device definitions](help/DEVICE_DEFINITIONS.md)
- [User definitions](help/USER_DEFINITIONS.md)
- [Wallpapers](help/WALLPAPERS.md)
- [DMT Replicate](help/REPLICATE.md)
- [Push notifications](help/PUSH_NOTIFICATIONS.md)
- [User core extensibility framework](help/USER_CORE_FRAMEWORK.md) ⚡

Example use cases (more are coming):
- [Playing media files stored on local network-attached storage](help/use_cases/PLAY_MEDIA_VIA_NAS_SERVER.md)
- [Showing your recent favorite tweets](help/use_cases/TWITTER_INTEGRATION.md)
<hr>

Advanced / theory:

- [Compatible open hardware list](https://github.com/uniqpath/info/blob/master/hardware)
- [RaspberryPi 3B+ setup guide](https://github.com/uniqpath/info/blob/master/assets/pdf/rpi_guide.pdf)
- [Theory and technical documentation](https://github.com/uniqpath/info/tree/master/docs)

# Background and motivation

**Computer is a tool.** For what? It is a general multipurpose tool for **anything you can imagine**.

The only thing **it cannot do** is to imagine what it should be used for.

Computers are always clueless, they are machines without any sense of existence and they will stay this way for hundreds of years if not much longer. We are still years and years from any meaningful breakthrough in general AI.

<a href="https://en.wikipedia.org/wiki/John_von_Neumann">John von Neumann</a> more or less proved that human brain architecture and digital logic arhitecture are two different worlds entirely. If this is indeed correct, then computers **cannot ever know** what is their purpose at all. Since they are general purpose tools, they can have almost any purpose defined for them. By humans of course.

Historically centralized and well funded groups, committees and organizations had the most power over **definition of the purpose of computing**. There were always some hackers, freedom fighters and other individuals who believed there should exist an **alternative side**, just for some *counter-balance*. It is true that computing as it exists today would never have happened if not for these exact big structures and this is great. They did their job.

Things change and move on though.

It is worth mentioning that these *alternative thinkers* are sometimes overly combative or non-conformistic but a lot of times they / we are right in that there should be more options for *less constrained and controlled computing*. We will continue creating these options even if we are not paid a lot or at all. We do it because we think it is important, we do it for ourselves and we like what we do. This type of computing does not live in some alternate disconnected reality, it still uses big centralized services and products coming from these organizations. It uses them when absolutely neccessary at that particular moment in time and/or for specific needs because they are the correct (sometimes the only) choice. Also, some organizations are much better than others and integrating the least invasive solutions among all the options is also a proper art.

What is always used in any system are common internet and other protocols (HTML5, ECMAScript, hardware etc.), usually coming from big organizations in the past but more and more being developed by open-source fragmented communities all over the world (example: blockchain protocols).

Conclusion is that more and more each day, **You**, today, can help define the true purpose of computers and computing.

There are **many projects springing up** that think along these same lines — they genuinely want to provide an upgraded computing experience to anyone interested. This project is one of such projects. Keep in mind that no two endeavours are or can be the same or even remotely similar (when you start looking into the details). The easiest way to approach this, in our opinion, is not to just look how the program appears or behaves but what are its building blocks and how they are put together. After enough learning you can then rearrange the blocks to fit your exact idea of what personal computing means to you. Define your purpose through defining little computing helpers around you.

What should they do for you? In what way? How do they make your life easier?

<img src="https://github.com/uniqpath/info/blob/master/assets/img/screens/screen4.jpg?raw=true">

## Blah Blah Blah, just tell me what is this, now!

**OK!** It is about storage, transmission and manipulation of information.

<img src="https://github.com/uniqpath/info/blob/master/assets/img/claude_shannon_unicycle.jpg?raw=true" width="500px">

We hope this explains everything 😶

Let's continue with the details now (because details are important and everything is usually made of them).

## We forgot to add something

When discussing the usual and "alternative *(freedom-focused)*" approaches to computing and some historical overview we didn't mention that the coming era of IoT might **be a bit different**. It may warrant a throughout reexamination of how we approach things and how we are always too lazy until it's too late. If we allowed ourselves to get used to "free free free" online services without too much thinking in the past decade or two, we are only just now discovering some downsides to all of that. This is a great book worth reading:

<img src="https://github.com/uniqpath/info/blob/master/assets/img/life-after-google.jpg?raw=true" width="300px">

And this video (on **YouTube**, just because, don't ask, life is paradoxical! ;) <a href="https://www.youtube.com/watch?v=Np5ri-KktNs">is also interesting</a>.

<hr>

We are not taking any sides here, we are just observing and thinking. Like everybody else that likes to observe and think *in interesting times*. We do have some first-hand practical opinion about a particular segment of the coming technology explosion though — **the Internet of Things** revolution. Like a lot of very *overloaded terms*, **IoT** is also quite overloaded with potential meaning — it could mean many different things with different nuances and interpretations. Also, it has been *immediately incoming* for a few years now, too. But still, it is coming and coming very fast. Time to get prepared.

**One thing** is almost certain and very logical, also practically experienced many times already — and that is:

**Thou shalt not trust connected devices** in general. As a first reflex you should be very sceptical when buying some "cool internet connected gadget" by a random (or even well established) company. Just think about their (usually naive) business model: usually you are sold something (a device, gadget, sensor etc.) quite cheaply (because they are in fight with competition and want to gain a foothold eg. *initial market share*). They don't get their costs covered in this way, especially if they took a big VC investment and later sales turn out to be "a bit less than they expected".

What is the next step? Either start charging you a lot more for their backend services that are supporting their smart devices OR they start selling your data **gathered in your home** to "interested buyers" (and they just love such personal data, no fear about that!). For example: Roomba cleaning robots are now known to happily explore, analyze and sell your floor plans. Why not, money is money! 🙄🤢🤮. **Another downside** of having too many unneeded third party connected devices in your home is that you then have "an app" for each one of them. Again, no "black and white" thinking here but if not before, **now** is the right time to start implementing at least some part of the future technology in your home through your own thinking and open software and hardware **you control**. If you don't control your devices, the people behind "your devices" will control you. They will do it so well you won't even know you are being controlled and manipulated. It goes step by step, like boiling a frog. People like power over others and they always get it if other people are not thinking properly or at all. Just think about it :) ✌

# DMT PROCESS

The DMT PROCESS (`dmt-proc`) is the main coordinator process that runs on each machine in dynamic **dmt-system** network.

It is a piece of `node.js` code that:

- spawns `Rust` binaries dynamically as needed (for example when searching the file system)
- spawns or connects (if already running) to `mpv` (multimedia player) process
- produces `HTML5 GUI` which can be rendered in browser, GUI can seamlessly *"warp"* to any other device with `dmt-proc` nearby
- can easily replicate itself (on demand) to any machine

<hr>

As mentioned, two technologies are used to build up the core:

- **node.js** — high-level evented framework, **built for speed**
- **rust** — native compiled code for low level machine operations, **built for speed**

Node.js is great because of highly dynamic, secure, performant and modern JavaScript base and the underlying V8 virtual machine. It is not set in stone that the biggest part of dmt core will always be in node.js, it could move to Rust as well. But not today. Node.js allows for much faster experimentation and is at the same time more than good enough for production use, even perfect.

Rust is used in some strategic parts where node.js does fall short for our needs. The one important (and only) case for now is searching for files in the device's filesystem at native speeds (not possible to do it any faster). We achieve this by combining two fantastic Rust crates: [walkdir](https://docs.rs/crate/walkdir) and [regex](https://docs.rs/crate/regex). We add some [glue](https://github.com/uniqpath/dmt/blob/master/core/rust/walksearch/src/main.rs) and this is called **walksearch**. Walksearch is 50% of the reason why [dmt search architecture](https://github.com/uniqpath/info/tree/master/docs#search-architecture) is so rapid.

Bash scripting is used for:

- syncing the core to other devices
- enabling `dmt` command
- as a framework to enable more handy shortcuts and add your own

Bash is important but the main part of the project `dmt-proc` has nothing to do with bash.

Core never calls bash functions except in [a few specific cases](https://github.com/uniqpath/dmt/blob/master/core/node/aspect-meta/dmt-bash-exec/index.js):

- there is an option in the gui to restart the device (RaspberryPi) - when user clicks `reboot` button, nodejs executes a bash script which executes the reboot process
- putting the device in `ap mode` (access point so that RPi shares its own wifi)

**Interesting combination of technologies — dmt-system ~1.0:**
<img src="https://github.com/uniqpath/info/blob/master/assets/img/lang_distribution.png?raw=true">

# Install

**Linux** (Debian, Raspbian etc.) / **macOS** / **Windows 10 Ubuntu shell**:

Short, simple and effective install 💡🚀🎸:

```
git clone https://github.com/uniqpath/dmt.git ~/.dmt; cd ~/.dmt; ./install
```

See [complete install instructions](help/GETTING_STARTED.md) (you need a few dependencies like `node.js` ...).

<hr>

**What is required for dmt-system?**

- one computer or even better: one normal computer and a few dozen _single board computers_ like [RaspberryPi 3B+](https://github.com/uniqpath/info/blob/master/hardware), <br>the more the merrier.
- **courage** (nothing of lasting effect can be done without it)

You need courage here because this an unknown code and it could very well delete your computer. It is a possibility.

Should you take the risk?

![bttf](https://github.com/uniqpath/info/blob/master/assets/img/bttf.jpg?raw=true)

The code is all-right, it won't:

- do anything unplanned with your file-system
- send any data anywhere.

All of this can be checked ← everything is in the repo. We only mention this because in general you should be very careful.

Currently we have no instant and/or simple solution for your dilemma though. *Do as you want.*

<hr>

We are scaring you a bit because if there is no danger now, there will be plenty after `v1.2` when you start connecting electrical appliances. These things are no joke! Read and learn carefuly and hopefully you are already somewhat educated about the dangers of electricity and know your limits (and possibly how to expand them).

Full disclaimer: you can still only use audio/video/search part of the system after `v1.2` — everything is very modular and each module is completely disabled by removing just one line in a particular file.

![bttf](https://github.com/uniqpath/info/blob/master/assets/img/lion.png?raw=true)

**Don't worry, be <a href="https://brave.com/">brave</a>.** Oh look, a plug for a browser! That's because we also have an extension which sets the homepage (for new tabs) to open **dmt-system gui**. Come back to this repo in the second half of january to get it!

## Update

This command will fetch changes from GitHub:

`dmt next`

In one of the next versions there will be an option to turn on a notifier to know when the next version is available.

## Uninstall

All you need is: `rm -rf ~/.dmt` (this removes the entire `~/.dmt` directory without asking)

Everything needed for the entire project lives inside this **one directory**.

⚠️ Be careful if you want to preserve your settings and other data inside `~/.dmt/user`.

# Development plans for 2020

![bttf](https://github.com/uniqpath/info/blob/master/assets/img/vision2020.jpg?raw=true)

### January 2020 ≡ v1.0

1. LAN-decentralized multimedia player
2. LAN device-to-device messaging and coordination system to support 1.

### Beginning of 2020 ≡ v1.1

Various improvements and upgrades to **dmt-player**.

### Spring/Summer 2020 ≡ v1.2

1. Generalized **Home IoT control panel** ("free open source home controller")
2. Level 2 IoT — small DIY sensors and devices that integrate with control panel<br>
   *"complete freedom to imagine"* for electronics and automation enthusiasts
3. LAN device-to-device messaging and coordination system to support 1. and 2.

We are already using a lot of this but it is not yet developed or consolidated enough for release.

Write an email if you already want to know more and actually use it. We will see what can be done to help you.

## End of 2020 ≡ flexible

We will see what things from the infinite bag of urgencies need to be done then.

## More explaining

*"If you cannot explain it, you don't understand it very well"* is a bad analogy for dynamic and/or complex systems.

We respond with: "If you understand it, you cannot explain it" (or something random like that).
<br>
Mr. **Van Morrison** is singing about this topic <a href="https://en.wikipedia.org/wiki/Why_Must_I_Always_Explain%3F">in this work</a> ♪♫♬.

**The point of dmt-system is not to be something "magical" but to do exact same things you have "always" done with computers but do them a bit better and on smaller computers than before.** Because small **and cheap** computers exist now for the first time in human history. They are available but not yet widely spread. This trend is only just beginning. Be early this time. There is other great software for these new kinds of platforms too but there is **dmt as well**. Try everything.

This system (of code and data philosophy) is designed to save you time and effort in longterm instead of wasting it. It does require some initial setup and thought, of course. Systems with nearly zero initial effort tend to squeeze you "for something" in the longer term. This is quite obvious — if others keep doing all the effort and thinking for you, you owe them something for their work. If you do most of it yourself through open hardware and freely available software, then you don't owe anything to anyone and it should feel great.

<img src="https://github.com/uniqpath/info/blob/master/assets/img/alternity.jpg?raw=true">

# We are glad to help you get started

There is enough material on our <a href="https://github.com/uniqpath">GitHub</a> to get you started. In case you do need assistance, we are available for consulting and practical help at <a href="mailto:info@uniqpath.com">info@uniqpath.com</a>. Write us and we will find a solution! We think that during 2020 we can mostly help for free and if there is enough community and practical knowledge built up afterwards, we will then only offer more involved consulting for bigger system planning. All code on GitHub will always remain free.

## dmt-system v1.0 release

**Jan 1st is just a slow, a bit uneventful start.** Expect steady stream of useful updates during 2020.

What obvious thing is missing in v1.0? — Proper responsive layout for smaller screens. Sorry! Soon™ → v1.0.1

Some other small things also slipped into v1.0.1 but we did even more than planned for v1.0, thank you to all cca. dozen testers! Especially to a 2-year old daughter of the main (sole atm) commiter to this repo. She found some really interesting glitches and even solutions. Kids these days ^_^ ... And thanks to her mother and brother too! And also the whole extended family. We did this together. In the next 10 year period we will do even more. The more we do, the more we need to be organized and we write all the code to achieve that. Computers these days... they are cheap and small. Where they lead, nobody knows ... They seem to lead to the real world though.

<img src="https://github.com/uniqpath/info/blob/master/assets/img/fireworks.jpg?raw=true">

# License

An experiment as well — [LICENSE](LICENSE) — have fun reading and don't laugh, it's true! ☻
