<img src="media/logo_connectome.png?v=2">

This small and lean JavaScript library facilitates:

**Encrypted dynamic connections between each two endpoints.**

It provides code for the initiator of connections and it works transparently between:

- two node.js processes
- between in-browser JavaScript and a node.js process

## How to start?

Get the library on your computer:
```
git clone https://github.com/uniqpath/connectome.git
cd connectome
npm install
```

### Run a sample server and client:

```
cd examples
```

Run connection receiver in first terminal tab:
```
node --experimental-modules --experimental-specifier-resolution=node server.js
```

Run one connection initiator in another terminal tab:
```
node --experimental-modules --experimental-specifier-resolution=node client.js
```

You can try running more than one as well. Each one will set a connection with receiver with a different shared key.

## Warning

⚠️ ⚠️ ⚠️

Experimental, not for production use. It will be worked on and improved.

What library doesn't do yet but will soon:

- properly use nonces (for now it is a constant nonce for each sent message) - this is easy to update and will be done soon
- consider man-in-the middle attacks, we will add this soon so that connection receiver public key is optinally checked against a known value
