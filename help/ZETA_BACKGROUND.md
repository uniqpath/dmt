## 🐠 Zeta Explorers Network

A **Zeta Explorer Node** is a `dmt-proc` which is:

- running on a server with public IP address
- is part of **Zeta Explorers Network** (meaning that community node [ZetaSeek](https://zetaseek.com) is ["following"](https://zetaseek.com/file/dmt_following_peerlist.png?place=localhost-2f686f6d652f7a6574612f46696c65732f444d542d53595354454d2f50726573656e746174696f6e73) it).
- is auto-updating<sup>*</sup> to keep compatible with other nodes in the network
- provides all further education about the **dmt-system** and it's capabilities

<sup>*</sup> <i>from GitHub, infrequently, a few seconds downtime on each update</i>. Auto-update can be easily turned off but on (rare) protocol breaking changes the non-compliant nodes will stop being part of ZEN network. We added auto-updates **last** because nobody is ever forced (encouraged yes but never forced or nagged) to update in general in fully independent setup. 

### Why join this early community?

In *Zeta Explorers Network* you learn how to use **dmt-system** via running your own `dmt-proc`, starting on a public server.

You can then use the same technology **disconnected from any network** as a 100% disconnected use case and you don't have to be a part of **ZEN network** anymore. If you are working as a coder on this project, you most likely are a part of ZEN network for easier collaboration on development of the system itself.

### Mathematical theory behind partitioned networks

When looked from topology perspective the field of **discrete mathematics** with connected graphs can be used. In such networks there is no center of any kind. We don't even have bootnodes. Some sets of nodes are connected between themselves but not to any other node outside of their cluster. This is called a **connectivity island** or **connected subgraph**. It is important to have such feature because for example one's own Local Area Network (LAN) can be seen as a nice example of fully functional network even without the outside connectivity to the broader internet. When outside connectivity resumes then this local connectivity island can merge with another one (either owned by the same user or more broadly to interact with other peoples' devices / data).

### Does this have any relation to blockchains?

The answer is **YES** and **NO**.

YES because the project is founded out of passion from private money originating from early _risky_ blockchain investments that turned out to be correct (by pure chance but still) and are now quickly becoming a big part of the New World Order. Hopefully all other early investors are also doing something worthwile with their rewards.

NO because it's not an on-chain project.

YES because we're in the process of starting to use MetaMask as a basis for open decentralize pseudo-identity system for logging into public DMT nodes. All of this still offchain (meaning that no interaction with running blockchain nodes is needed, we only use math behind blockchain addresses). MetaMask is used for signing claims offchain with each user's Ethereum private key. 

We are not integrating any of blockchain capabilities (sending tokens, interaction with smart contracts etc.) for now. If we do this later it will be in an entirely modular fashion so that entire system can continue to function for 50+ years even if any particular blockchain disappears in the meantime.

### What differentiates this project from similar projects?

We could answer this question in more than one way but most important from the perspective we're currently looking from (ZEN node) is that:

- Our project does not use any type of (logical) central identities. This includes central databases of users or even one central place of users on-chain (like for example inside of some well known smart contract). Edward Snowden recently encouraged all properly decentralized projects to not go the easy route and use any kind of Globally Unique Identifiers for users. As explained briefly already: a lot of user registries, even if on blockchain are not really under total end user's control. We want users to manage their identities **through their own domain names and / or servers**. Blockchains are very useful for many purposes but for this one we decided to go in this particular direction. Identifying users (to degree they want to be identified and to whom) through their own public Ethereum addresses (via MetaMask) which they fully control is the right approach.
- We will never compromise on code quality even for price of (sometimes) slower development. Please see the short essay about long-term [Working Software](https://zetaseek.com/file/working_software.pdf?place=localhost-2f686f6d652f7a6574612f46696c65732f756e697170617468). One of our core principles is to keep avoiding unsustainable quantities of [Technical Debt](https://en.wikipedia.org/wiki/Technical_debt). Projects that grow fast usually also disappear quickly. Reasons are understandable when looked from technical perspective through lenses of experience. Quick development means hasty decisions, convoluted code, many people working together that don't manage to keep their mental model of how software works entirely synced, lots of money spent (which means outside investments with attached pressures are involved).

### Don't be afraid to try something new early

Who is this for?

> The future belongs to the curious. 
>
> The ones who are not afraid to try it,
>
> explore it, poke at it, question it and turn it inside out.

For live Q&A / DEMO please join one of [DMT Meetups](https://dmt-system.com).

**TIP** 💡It becomes much less confusing after you install your first node 🐠

**TIP** 💡This is unfortunately still only suitable for people already familiar with **basic concepts** of command line, server or single-board-computer management and desires for understading their computing in more detail than usual average person (90% of everyone that mostly have other important pre/occupations in life).

### A call to you?

We are not looking for thousands of new users at this point, the most important *strategy* is to get **one open-minded person** once in a while who can really contribute ideas, testing or even code. When guided it is really far from being scary, everything makes total sense but we have only so much capacity for introducing people into the world of self-sovereign computing of this kind. For people with more advanced knowledge we believe everything currently developed can be figured out from the information online (links shared in this document). You just have to try. Permissionlessly. You don't have to contact me or anyone else from the team to start playing around... but of course you can if you think you need help. We are not flooded by requests or anything like that at the moment.

Currently we are working with a team of around 10 people who actively do these things and beginning of 2022 we will gladly and actively look for more interested people (up to 100) since at this point we'll have even more to show regarding functionality, great user interfaces and overall clarity.

Join our [Discord](https://discord.gg/XvJzmtF) and check our entry point [uniqpath.com](https://uniqpath.com/).

### Project structure

- [DMT node](https://github.com/uniqpath/dmt) — device running DMT ENGINE (= `dmt-proc`), a device can be a personal computer, personal server or a single board computer like RaspberryPi
- [Connectome](https://github.com/uniqpath/connectome) — connectivity and state syncing library for inter-node communication
- [uniqpath](https://uniqpath.com) — informal global research organization maintaining this project
- zeta* — public demo and community organization nodes
- [dmt-system](https://dmt-system.com) — online meetups entrypoint

### Who is in total control of this project?

[One person](https://davidkrmpotic.com/)! You can count on me not screwing up this project intentionally. The fact is that I didn't collect any money from anyone for doing this so I'm not accountable in this fashion. I have no debts and no pressure. Only pressure is creating great, working and fast software to advance my sense-making and automation capabilities further. The system is primarily developed for actual use for me and those *nearby* (family, friends) and anyone else using it is a nice side-effect (but very much required / desired / invited because of many benefits to the project itself → meeting great people, helping with idea input, identifying any broader issues etc.). I couldn't find anything that did all the things in personal automation and knowledge management area that ticked all the boxes. For sure a part of the reason is not wanting to be dependent on *other people's or companies software* for this because time and time again services have shut down or open source software stopped being maintained. Foremost factor why this project will not fizzle is because I want to keep using it for many decades and only in 10 to 20 years some contingecy plans will be put into place when there are many trustworthy people using and understanding the system. From other users perspective this system does look a bit different in regard to "dependecy" category than it does from my side but please study all pros and cons and then decide what to do. Even now you can rest assured that if I get hit by a bus tomorrow nothing stops working because all code is local on your device(s). Development probably stops but someone can surely raise to the occasion (all code is online). It could even happen that everyone interested in this can continue working on codebase by themselves without regard to compatiblity with other nodes. This would be a shame but it's also an option because focus is on **local (individual) usage** and only then inter-personal communication and data exchange. It's really decentralized and I'm putting a lot of further thought (with help of many smart input from other people with similar long-term views) into how to make this really sustainable for a long time to come.

System is 100% decentralized while running (DMT processes spinning), however development is not "decentralized" in the same way as Bitcoin or Ethereum development is. I don't write all the code anymore but I do check every line of code going into [core repository](https://github.com/uniqpath/dmt). To decide if this project is for you, you have to understand my views and vision for the system and then decide if I'm the right leader for a personal device / search / networking system you'd likely trust. 

I adhere to strict ethical principles which probably need more explaining and this is a task for me to deliver soon in written form. The fact is that wrong line of code could delete or expose any file on the device you install **DMT ENGINE** on, there is no technical way around this. Trust is needed in people gatekeeping the codebase and it's probably to have this trust in one person with clear track record of not doing bad things than to a bigger group that can start infighting and put everyone else in danger.

I don't run any servers for anyone else than me or my family so I can sleep well with knowing that code in static form is good and functional. Hardware and other problems are on each individual user of this system to care for themselves. Because of **disconnected / local-first architecture** of the system it is impossible to know how many nodes are running in production. I suspect that more and more each day based on other signals around the project and this is great. A lot is still missing and next years will be very interesting.

We will try to develop completely decentralized app store system for **DMT frontend apps** and these will be further parts of the system totally outside of my control. Currently I am not aware of any decentralized app store attempts (with each developer having their own app store). We will utilize other emerging p2p technologies to achieve these new capabilities. 

This project is already the result of thousands or rather millions of people working hard in the industry. We take the best open free work and use it as much as reasonable. 

In this project we appreciate cummulative history of knowledge (technical and broader) and look forward to much more exciting revelations coming our way globally!

### Other developers contributing the code

Our work since the end of 2020 is structured in the following way:

- in Q4 of each year we do two things:
  - present all the work since beginning of year on regular weekly meetups
  - start working on new features with a newly forming team, usually young people with open minds (using new emerging technologies and libraries but also verified older common ones when they are still relevant)
- in Q1 of each year:
  - we continue work with members of new team that would like to continue for one additional quarter and have proven themselves in previous quarter
- in Q2 / Q3 of each year:
  - usually no big new features are introduced and there are no paid collaborators working on the project
  - we test new things, get further input through usage and:
    - prepare presentations for Q4
    - think about what to start developing next or experiment with in coming Q4
    - we carry [promising experiments](https://github.com/dmtsys) over the New Year's Eve checkpoint and conclude them in Q1 of coming year, most have be small enough for this to be possible. Working code gets bundled into the [main repository](https://github.com/uniqpath/dmt).
    - holiday rest from at the end of year is usually refreshing and it becomes clear what the next steps should be, same goes in regard to summer vacations (on northern hemisphere)

And so we go in a perpetual yearly cycle with half of the year working hard and other half consolidating our work.

### Dangers

This project is likely to be misunderstood a lot and it is entirely clear why by now.

The only way to really understand how it works **(in its current incarnation which is not the same as for example in 6 months)** is to try it. **Not many people will.** Mostly because they:

- don't have enough computing skills to upgrade their management of personal computing
- they are not interested in acquiring more skills because of lack of interest / advanced age / other priorities
- they could possibly do it but they don't try because of many other things competing for attention or this project seeming too broad (because it is very broad)

Hence people that hear about this and don't invest enough time and effort into it by actually trying on their devices will always think it's some kind of vague foggy mystery, possibly "a scam" or at least something totally silly. **Perhaps it is but how can you really know?** 

On the other hand people doing their own computing (in general, not just through DMT) will get more and more advantage because of better organization, insight, verified knowledge, sense-making capabilities, independent access to real experts, they themselves turning into an expert over time and so on.

As an example: some people avoided all things Bitcoin / blockchain since the beginning and they have been left behind in many ways already. Sad but true! Progress never stops. It will continue and digital divide will probably get wider and there is no simple solution to that. Try to be on the right side of progress if at all possible. Missing out on progress can have dire consequences because, as I learned myself, nobody will really care or look after you in modern times. We should help each other but not at the expense of everyone going down. Everyone has to become smarter and contribute reasonable solutions. If you think you missed out on any big shifts and you have kids, then try to remedy mistakes by encouraging your kids to take mathematics, logical thinking and lifelong learning seriously. Encourage them to tinker with hardware and software and to not fall prey to easily consumed but potentially very wrong information that is very abundant.

Stop learning other less useful things and learn more computing. It is starting to make more and more sense each day. Then use computers to learn about everything else in much more efficient manner. Scary vacuum tubes or punch cards are not reality anymore for a long time. Imagine using that! We don't have to, what great times we are living in. We have great working systems now and we should have more in the future. Without the right mindset(s) and further investments into working (non-exploitative) code it won't happen though. Nothing really great happens by itself, it only degrades with no external organizing input. We should and will become more self-organized. Self-organzation islands will emerge and dynamically merge and unmerge with other such islands as needed.

Rock on! 🎸 :) 

