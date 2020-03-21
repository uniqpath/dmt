<img src="media/logo_connectome.png?v=2">

This small and lean JavaScript library facilitates:

**Encrypted dynamic connections between each two endpoints.**

It provides code for the initiator of connections and it works transparently between:

- two node.js processes
- between in-browser JavaScript and a node.js process

Receiver side is not yet fully open-sourced but will be soon after it is further tested and developed. Receiver can asynchronously compose and pipeline communication to further parallel connections.

## Address structure

**Example dialup address:**

```
connectome://spacefish.io:7780:fiber:4d41beb083a102f527965d94e2379003d969726b0ebb1c6db86cf24c37686176
```

**Components:**

- server node ip / url
- WebSocket port
- WebSocket protocol
- Public key of the endpoint

## How to start?

[INFO COMING SOON]
