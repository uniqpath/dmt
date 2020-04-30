import { stores } from 'dmt-js';

const { SessionStore, ConnectedStore, LogStore } = stores;

import App from './App.svelte';

const port = 7780;
const protocol = 'zeta';
const protocolLane = 'gui';

const rpcObjectsSetup = ({ store }) => {
  return {
    Receiver: {
      msg: msg => {
        store.set({ msg });
      }
    }
  };
};

const logStore = new LogStore();

const log = console.log.bind(console);
console.log = (...args) => {
  logStore.addToLog({ origConsoleLog: log, limit: 100 }, ...args);
  log(...args);
};

const verbose = false;
const session = new SessionStore({ verbose });
const store = new ConnectedStore({ port, protocol, protocolLane, rpcObjectsSetup, verbose, session, logStore });

const app = new App({
  target: document.body,
  props: {
    store
  }
});

export default app;
