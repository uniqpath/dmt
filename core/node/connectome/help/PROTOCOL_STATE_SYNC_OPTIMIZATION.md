### Protocol state sync inner workings and considerations

Only the diff of the state is sent to already connected clients and not the entire state on each update. This is great for performance and bandwidth usage but you still have to make sure that `diff` operation is not very computationally expensive and design your state object and its updates (frequency and structure/depth) accordingly. For the usual use cases it is not a problem but you still have to be aware of potential dangers here. If things get slow then you have to decrease state update frequency or state schema.

If you do multiple consecutive updates which don't need strictly immediate effect on connected clients then you can do:

```js
channels.state.set({ author: 'Teresa Salgueiro' }, { announce: false });
channels.state.update({ album: 'O Misterio (2012)' }, { announce: false }); // some short time later

// finally 200ms later we announce the state change (which is default with `set` and `update` methods) 
// this causes state diff since last announce to be calculated and sent over the wire to all clients
setTimeout(() => {
  channels.state.update({ song: 'Lisboa' });
}, 200);
```

💡state diffs are calculated and applied using [RFC6902](https://datatracker.ietf.org/doc/html/rfc6902) JSON standard.