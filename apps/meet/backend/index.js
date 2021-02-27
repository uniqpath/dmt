import dmt from 'dmt/bridge';
import { MirroringStore } from 'dmt/connectome-stores';

// import { MirroringStore } from 'connectome/stores';

import state from './state';

const MAX_PEERS = 100; // this is the max number allowed for chat room.
const settings = { reconnectingTimeout: 30000 };

import makeApi from './makeApi';

function init({ program }) {
  const store = new MirroringStore(state);

  let channelNum = 0;

  const api = makeApi(store);

  function onConnect() {
    channelNum++;
    console.log(colors.blue(`channel ${channelNum}`));
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
      get connected() {
        return !this.disconnected;
      }
      get disconnected() {
        return this.channel.closed();
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
      emitLocal(signal, data) {
        this.channel.emit(signal, data);
      }

      emit(signal, data) {
        this.channel.signal(signal, data);
      }

      to(key) {
        const channel = this.get(key);
        const This = this;
        return {
          emit(signal, data) {
            if (!channel) {
              api.leave({ peerId: key });
              This.emit('signal-error', {
                key,
                code: 'CHANNEL-DISCONNECT',
                msg: `NOT in the room - channel key: ${key}`,
              });
              console.log('signal-error');
              return;
            }
            channel.signal(signal, data);
          },
        };
      }

      broadcast(signal, data) {
        this.room.participants.forEach((participant) => {
          const channel = this.get(participant.peerId);
          if (!channel) {
            this.emit('signal-error', {
              key,
              code: 'CHANNEL-DISCONNECT',
              msg: `NOT in the room - channel key: ${key}`,
            });
            console.log('signal-error');
            return;
          }
          if (channel._remotePubkeyHex !== this.key) channel.signal(signal, data);
        });
      }
    }
    return new _socket_(key);
  };

  channelList.on('new_channel', (channel) => {
    const socket = makeSocket(channel._remotePubkeyHex);

    socket.on('signal-connect', () => {
      socket.emit('signal-connect');
    });

    socket.on('join-room', ({ roomId, peerName }) => {
      console.log('join-room: ', peerName);

      if (api.getRoom(roomId)) {
        const len = api.getRoom(roomId).participants.length;
        // console.log(len)
        // console.log('checking for whether room is full')
        if (len >= MAX_PEERS) {
          // console.log('room is full')
          socket.emit('room-full');
          api
            .getRoom(roomId)
            .participants.forEach((s) => socket.to(s.id).emit('notAllowed-room-full', peerName));
          return;
        }
      }
      api.join({ peerId: socket.key, peerName, roomId });
      const peers = api
        .getRoom(roomId)
        .participants.filter((participant) => participant.peerId !== socket.key);
      // console.log(peers)
      socket.emit('joined-in-room', peers);
      socket.emit('settings', settings);
    });
    socket.on('signaling-peer', (payload) => {
      const signaledPeer = socket.to(payload.peerId);
      // console.log('signaling-peer');
      if (payload.signal.type === 'offer')
        signaledPeer.emit('user-joined', {
          signal: payload.signal,
          peerId: socket.key,
          peerName: payload.peerName,
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
        peerName: payload.peerName,
      });
      // console.log('returning-signal', payload.peerName);
    });
    socket.on('signal-disconnect', (reason) => {
      socket.broadcast('peer-disconnect', socket.key);
      api.leave({ peerId: socket.key });
      // console.log('signal-disconnect');
      if (reason) console.log(reason);
      // socket.emit('signal-disconnect');
    });
    socket.on('disconnect', () => {
      socket.emitLocal('signal-disconnect', 'disconnected');
      // let reconnected;
      // socket.on('reconnected', () => {
      //   reconnected = true;
      // });
      // setTimeout(() => {
      //   console.log('socket.reconnected', reconnected);
      //   if (reconnected) {
      //     socket.emitLocal('signal-disconnect', 'Reconnecting Timeout');
      //   } else console.log('connected again');
      // }, settings.reconnectingTimeout);
      // console.log('disconnected');
    });
  });
  // console.log('store', store, channelList);
}

export { init };
