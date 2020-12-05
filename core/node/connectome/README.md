<img src="img/connectome_logo.png" width="70%" style="float: left;">

## Dynamic realtime state and connectivity

✨ For **frontend** and **backend** (all three combinations: _F→B_, _B→B_, possibly _F→F_ as well). **JS** for now, soon **WASM**.

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

## Production use

API is not yet totally stable but getting there! Please wait until v1.0 release.

This library has seen a recent uptick in usage. Everyone can already experiment but as said, minor changes to current API can happen until v1.0.

v1.0 will include a few new features besides these currently included that only need polishing.

## Documentation

Soon. Stay tuned!

## Showcases

See [here](./help/SHOWCASES.md).

