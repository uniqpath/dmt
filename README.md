<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_title_release.png?raw=true&ver=5" width="545px">

**Website →** [dmt-system.com](https://dmt-system.com) 💡🚀🎸

# Motivation

What is a computer? Computer is a tool. For what? It is a general multipurpose tool for anything you can imagine.

The only thing **it cannot do** is to imagine what it should be used for.

Computers are always clueless, they are machines without any sense of existence and they will stay this way for hundreds of years if not much longer. We are still years and years from any meaningful breakthrough in general AI.

<a href="https://en.wikipedia.org/wiki/John_von_Neumann">John von Neumann</a> more or less proved that human brain architecture and digital logic arhitecture are two different worlds entirely. If this is indeed correct, then computers **cannot ever know** what is their purpose at all. Since they are general purpose tools, they can have almost any purpose defined for them. By humans of course.

Historically centralized and well funded groups, committees and organizations had the most power over **definition of the purpose of computing**. There were always some hackers, freedom fighters and other individuals who believed there should exist an **alternative side**, just for some *counter-balance*. It is true that computing as it exists today would never have happened if not for these exact big structures and this is great. They did their job.

Things change and move forward though.

And so, more and more each day, **You**, today, can help define the true purpose of computers and computing.

There are **many projects springing up** that think along these same lines — they genuinely want to provide an upgraded computing experience to anyone interested. This project is one of such projects. Keep in mind that no two projects are or can be the same or even remotely similar (when you start looking into the details). The easiest way to approach this, in our opinion, is not to just look how the program appears or behaves but what are its building blocks and how they are put together. After enough learning you can then rearrange the blocks to fit your exact idea of what personal computing means to you. Define your purpose through defining little computing helpers around you. What should they do for you? In what way? How do they make your life easier?

<img src="https://github.com/uniqpath/info/blob/master/assets/img/screens/screen4.jpg?raw=true">

## dmt-core

⚠️ **core code** - is missing from this repo at the moment. v1.0.1 of the core will appear at the release second as specified. We hope github is not down then!

Two technologies are used to build up the core:

- **node.js** — high-level evented framework, **built for speed**
- **rust** — native compiled code for low level machine operations, **built for speed**

Node.js is great because of highly dynamic, secure, performant and modern JavaScript base and the underlying V8 virtual machine. It is not set in stone that the biggest part of dmt core will always be in node.js, it could move to Rust as well. But not today. Node.js allows for much faster experimentation and is at the same time more than good enough for production use, even perfect.

Rust is used in some strategic parts where node.js does fall short for our needs. The one important (and only case) for now is searching for files in the device's filesystem at native speeds (not possible to do it any faster). We achieve this by combining two fantastic Rust crates: [walkdir](https://docs.rs/crate/walkdir) and [regex](https://docs.rs/crate/regex). We add some [glue](https://github.com/uniqpath/dmt/blob/master/core/rust/walksearch/src/main.rs) and this is called **walksearch**. Walksearch is 50% of the reason why [dmt search architecture](https://github.com/uniqpath/info/tree/master/docs#search-architecture) is so rapid.

# Development plan for 2020

## january 2020 → dmt-system v1.0

1. LAN-decentralized multimedia player
2. LAN device-to-device messaging and coordination system to support 1.

## beginning of 2020 → dmt-system v1.1

Various improvements and upgrades to **dmt-player**.

## spring/summer 2020 → dmt-system v1.2

1. Generalized **Home IoT control panel** ("free open source home controller")
2. Level 2 IoT — small DIY sensors and devices that integrate with control panel<br>
   *"complete freedom to imagine"* for electronics and automation enthusiasts
3. LAN device-to-device messaging and coordination system to support 1. and 2.

## end of 2020 → flexible, TBA

...

## More explaining

"If you cannot explain it, you don't understand it very well" is a bad analogy for dynamic systems.

**The point of dmt-system is not to be something "magical" but to do exact same things you have "always" done with computers but do them a bit better and on smaller computers than before.** Because small **and cheap** computers exist now for the first time in human history. They are available but not yet widely spread. This trend is only just beginning. Be early this time. There is other great software for these new kinds of platforms too but there is **dmt as well**. Try everything.

This system (of code and data philosophy) is designed to save you time and effort in longterm instead of wasting it. It does require some initial setup and thought, of course. Systems with nearly zero initial effort tend to squeeze you "for something" in the longer term. This is quite obvious — if others keep doing all the effort and thinking for you, you owe them something for their work. If you do most of it yourself through open hardware and freely available software, then you don't owe anything to anyone and it should feel great.

<img src="https://github.com/uniqpath/info/blob/master/assets/img/alternity.jpg?raw=true">

## So, what happens on 1.1.2020 at midnight?

Official website [dmt-system.com](https://dmt-system.com) gets updated, this repo receives **core code** and (more) documentation.

## Documentation in development

[More info](https://github.com/uniqpath/info)

[Compatible open hardware list](https://github.com/uniqpath/info/blob/master/hardware)

[Technical documentation](https://github.com/uniqpath/info/tree/master/docs)

PS: maybe you noticed → this project is currently in superposition of two states: released and not-yet-released.
