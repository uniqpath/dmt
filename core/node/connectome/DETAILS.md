<img src="img/connectome_logo.png?v=2">

## ⚡ Dynamic realtime state and connectivity

→ for client and server-side javascript (soon WASM)

## v1.0

Connectome 1.0 is set to be released on 1.1.2021.

## The Purpose of this LIB

This small and lean JavaScript library does **realtime connectivity** and **realtime state synchronization** between two remote processes.

It works transparently between:

- two node.js processes (over websockets or via IPC)
- between in-browser JavaScript and a node.js process (over websockets)

🔐 All messages and file transfers are encrypted.

⚡ Websockets guarantee the correct order of message delivery and this enables realtime maximum speed state synchronization.

🕹️ This type of speed is great for responsive frontends with remote or local state that have to feel like native apps with lowest possible latency.

🎨 One example is a drawing app. Every time you draw something on screen, the state should be able to change in the remote process and then be rendered in GUI (browser) instantly.



## How to try if you are a JS developer

Get the library on your computer:
```
git clone https://github.com/uniqpath/connectome.git
cd connectome
npm install
```

### Run a sample server and client:

```
cd examples/node-to-node/simple
```

Run server in first terminal tab:
```
node server.js
```

Run client in another terminal tab:
```
node client.js
```

Requires node.js with ES6 modules support, for example v13.8 and upwards.

Examples ready to use in your [Svelte](https://svelte.dev) apps are coming before Dec 1st 2020.

## Production use

API is not yet totally stable but getting there! Please wait until v1.0 release.

This library has seen a recent uptick in usage. Everyone can already experiment but as said, minor changes to current API can happen until v1.0.

v1.0 will include a few new features besides these currently included that only need polishing.

## Documentation

Soon. Stay tuned!

## Showcases

Example **web/dapp** using **Connectome Alpha** is https://zetaseek.com.

**ZetaSeek** is a Modular Decentralized Search Engine in Development.

<img src="https://github.com/uniqpath/info/blob/master/assets/img/zeta_banner.png?raw=true">

## Connectome heavy usage in 2021

It will be used for building apps in `dmt` appstore for realtime web applications.

**Visit DMT MEETUPS website for more information on this opportunity →** [dmt-system.com](https://dmt-system.com)

<img src="https://github.com/uniqpath/info/blob/master/assets/img/dmt_research_space.jpg?raw=true">

<!-- <img src="https://github.com/uniqpath/info/blob/master/assets/img/wolf_dark_moon.jpg?raw=true"> -->
