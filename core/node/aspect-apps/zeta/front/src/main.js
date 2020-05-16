import { stores, metamask } from 'dmt-js';

import FrontendStore from './frontendStore';
import ConnectedStore from './connectedStore';

import appHelper from './appHelper';

const { SessionStore, LogStore } = stores;

const { metamaskInit } = metamask;

import App from './App.svelte';

const port = appHelper.ssl ? '/ws' : 7780;
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
const frontendStore = new FrontendStore();

const rpcRequestTimeout = 5500;
const store = new ConnectedStore(frontendStore, {
  port,
  ssl: appHelper.ssl,
  protocol,
  protocolLane,
  rpcRequestTimeout,
  rpcObjectsSetup,
  verbose,
  session,
  logStore
});

const metamaskConnect = metamaskInit(ethAddress => {
  console.log(`Connected ethereum address: ${ethAddress}`);
  frontendStore.login(ethAddress);
});

const app = new App({
  target: document.body,
  props: {
    store,
    appHelper,
    metamaskConnect
  }
});

export default app;
