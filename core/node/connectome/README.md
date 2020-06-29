<img src="media/logo_connectome.png?v=2">

This small and lean JavaScript library enables:

**Encrypted dynamic connections between each two endpoints.**

It works transparently between:

- two node.js processes
- between in-browser JavaScript and a node.js process

## Features

- send and receive json messages
- RPC calls on javascript objects
- send and receive files

All messages and file chunks are encrypted.

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
node server.js
```

Run client in another terminal tab:
```
node client.js
```

Requires node.js with ES6 modules support, for example v13.8 and upwards.

## Production use

It is ready for production use.

## API docs

Soon™
