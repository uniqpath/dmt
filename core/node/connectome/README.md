<img src="media/logo_connectome.png?v=2">

This small and lean JavaScript library facilitates:

**Encrypted dynamic connections between each two endpoints.**

It provides code for the initiator of connections and it works transparently between:

- two node.js processes
- between in-browser JavaScript and a node.js process

## Features

- send and receive json messages
- RPC calls on objects
- send and receive files

All messages and chunks are encrypted.

## How to start?

Get the library on your computer:
```
git clone https://github.com/uniqpath/connectome.git
cd connectome
npm install
```

### Run a sample server and client:

```
cd samples/simple
```

Run server in first terminal tab:
```
node --experimental-specifier-resolution=node server.js
```

Run client in another terminal tab:
```
node --experimental-specifier-resolution=node client.js
```

## Warning

⚠️ ⚠️ ⚠️

Experimental, not for production use. It will be worked on and improved.

What library doesn't do yet but will soon:

- consider man-in-the middle attacks, we will add this soon so that connection receiver public key is optinally checked against a known value
