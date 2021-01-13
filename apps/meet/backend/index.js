import dmt from 'dmt/bridge';
import { MirroringStore } from 'dmt/connectome-stores';

// import { MirroringStore } from 'connectome/stores';

import state from './state';

import makeApi from './makeApi';

function init({ program }) {
  const store = new MirroringStore(state);

  const MAX_PEERS = 100;

  let channelNum = 0;

  const api = makeApi(store);

  function onConnect({ channel }) {
    channelNum++;
    // channel.attachObject('dmtapp:meet:rooms', api);
    console.log(colors.blue(`channel ${channelNum} connected`));
  }

  const channelList = program.registerProtocol({
    protocol: 'dmtapp',
    lane: 'meet',
    onConnect,
  });

  const makeSocket = (key) => {
    class _socket_ {
      constructor(key) {
        this.channel = this.get(key, false);
        this.key = key;
      }
      in_room(key) {
        return this.room.participants.find((participant) => participant.peerId === key);
      }
      get room() {
        return api.getPeerRoom(this.key) || { participants: [] };
      }

      get(key, in_room = true) {
        const channel = channelList.channels.find((channel) => channel._remotePubkeyHex === key);
        if (in_room) {
          return this.in_room(key) ? channel : undefined;
        }
        return channel;
      }

      on(signal, fn) {
        this.channel.on(signal, fn);
      }

      emit(signal, data) {
        this.channel.send({ signal, data });
      }

      to(key) {
        const channel = this.get(key);
        const This = this;
        return {
          emit(signal, data) {
            if (!channel) {
              This.emit('signal-error', { msg: `channel with key: ${key} is not in the room` });
              console.log('signal-error');
              return;
            }
            channel.send({ signal, data });
          },
        };
      }

      broadcast(signal, data) {
        this.room.participants.forEach((participant) => {
          const channel = this.get(participant.peerId);
          if (!channel) {
            this.emit('signal-error', {
              msg: `channel with key: ${participant.peerId} is not in the room`,
            });
            console.log('signal-error');
            return;
          }
          if (channel._remotePubkeyHex !== this.key) channel.send({ signal, data });
        });
      }
    }
    return new _socket_(key);
  };

  store.mirror(channelList);
  channelList.on('new_channel', (channel) => {
    const socket = makeSocket(channel._remotePubkeyHex);

    socket.on('signal-connect', () => {
      socket.emit('signal-connect');
    });

    socket.on('join-room', ({ roomId, name }) => {
      console.log('join-room: ', name);
      if (api.getRoom(roomId)) {
        const len = api.getRoom(roomId).participants.length;
        // console.log(len)
        // console.log('checking for whether room is full')
        if (len >= MAX_PEERS) {
          // console.log('room is full')
          socket.emit('room-full');
          api
            .getRoom(roomId)
            .participants.forEach((s) => socket.to(s.id).emit('notAllowed-room-full', name));
          return;
        }
        api.join({ peerId: socket.key, peerName: name, roomId });
      } else api.join({ peerId: socket.key, peerName: name, roomId });
      // peerRoom[socket.key] = roomId;
      const peers = api
        .getRoom(roomId)
        .participants.filter((participant) => participant.peerId !== socket.key);
      // console.log(peers)
      socket.emit('joined-in-room', peers);
      // socket.join(roomId)
      // socket.to(roomId).broadcast.emit('user-connected', {userId, data})
      // console.log(userId)
    });
    socket.on('signaling-peer', (payload) => {
      const signaledPeer = socket.to(payload.peerId);
      console.log('signaling-peer');
      if (payload.signal.type === 'offer')
        signaledPeer.emit('user-joined', {
          signal: payload.signal,
          peerId: socket.key,
          name: payload.name,
        });
      else
        signaledPeer.emit('receiving-candidate', {
          peerId: socket.key,
          signal: payload.signal,
        });
    });
    socket.on('returning-signal', (payload) => {
      socket.to(payload.peerId).emit('receiving-returned-signal', {
        signal: payload.signal,
        id: socket.key,
        name: payload.name,
      });
      console.log('returning-signal', payload.name);
    });
    socket.on('signal-disconnect', () => {
      socket.broadcast('peer-left', socket.key);
      api.leave({ peerId: socket.key });
      console.log('signal-disconnect');
    });
  });
  // console.log('store', store, channelList);
}

export { init };
