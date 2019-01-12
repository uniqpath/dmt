# DMT 🚀☘

> Simplicity is the ultimate form of sophistication.
> — Leonardo da Vinci

We are developing a time synchronisation platform for devices with CPU, basically creating a virtual clock that keeps all devices in sync so that the shared state is pedictable.

State is synchronized over four-tier eventing architecture with each level doing focused work. Levels are:

- on device
- on link-local network
- on global network
- on UI clients (mostly via new `WebSocket technology` — `ws://`)

This is a general computing platform that integrates with blockchains and everything else related to computing.

Time synchronisation is always a challenge and we took a sane approach with some well understood tradeoffs. The benefit is that our clock can be down to `0.1s` or even `µs` in some cases as compared to most blockchains where it is tens of seconds or even minutes for blocks to be finalized. Of course our system is not better, just complementary and mutually reinforcing with various other great systems and approaches. Since everything is so flexible, modular and open, the implementer of the whole has to know quite a lot to achieve nearly perfect final design with well defined characteristics.

## More interesting features:

### Disappearing private keys

Since people are bad with keeping their private keys safe, our system helps by loosing private keys all the time because they are cheap to regenerate. If a private key is lost, *someone else* looses access to your content, you do not.

## Install

    curl -L https://raw.githubusercontent.com/uniqpath/dmt/master/shell/web-one-line-install-script | bash

or Update if already installed:

    dmt next

## Run

    dmt version

Now a lot should already work (see `dmt help`) but all of it is transactional on explicit user request (like http protocol for example). To get background processing and thus most out of the system, you will want to start a few background services (default ones are: `dmt-controller` and `search-and-play`) with:

    dmt start

See what the system is doing at each moment (hint: not much by design, only when needed and requested):

    dmt log

[More info](INSTALL.md)

## Where?

- servers _(example: for data and search processing)_
- **laptops or PCs** _(example: as a remote controller device for sbcs, as a consumer of personal server data etc.)_
- and especially **single board computers (SBC)** (RPi, odroid etc.) _(as digital slaves, as it should be)_

## But why?

Examples of what could be achieved with this technology:

🚀🎸🌀 [Tutorials](https://github.com/uniqpath/everything/blob/master/tutorials/README.md)

## Computing Elves Inside Your Machine

“In short, I do not believe DMT is a gateway to an alternate dimension, nor does it induce contact with autonomous elves and alien entities. Yes, DMT produces a vivid other-worldly landscape when ingested, often including elves, aliens, insects, snakes, jaguars, etc. This is true for the majority of people who try it. Some people do not have such vivid responses, but many do. Although this may appear at first glance to be "shocking," it is actually no more shocking then the fact that most people dream at night, or that most people see geometric patterns (pressure phosphenes) when they close their eyes and press against their eyeballs. But the difference between pressure phosphenes and DMT is that DMT is illegal and very hard to come by, so most people never have the opportunity to experience it. If we could all hold our breath for a minute and produce vivid hallucinations of alien landscapes it would seem quite mundane, no more than a mere curiosity of the human condition. However, since this particular alien landscape is produced by a specific rare substance (DMT), people seem to think it is akin to unlocking the mysteries of the universe when they actually get their hands on it.”

— from __The Case Against DMT Elves__ by _James Kent_

![DMT](https://subcults.com/img/bitcells.jpg)

Runs [everything](https://github.com/uniqpath/everything).

