import * as dmtJS from '../../../../dmt-js';
import { stores, concurrency } from '../../../../connectome';

const { metamask } = dmtJS;

import loginStoreFactory from './loginStore';
const LoginStore = loginStoreFactory(stores.SimpleStore);

import connectedStoreFactory from './connectedStore';
const ConnectedStore = connectedStoreFactory(stores.ConnectedStore);

import appHelper from './appHelper';

appHelper.deps = { dmtJS };

const { LogStore } = stores;

const { metamaskInit } = metamask;

import App from './App.svelte';

const port = appHelper.ssl ? '/ws' : 7780;
const protocol = 'zeta';
const protocolLane = 'gui';

const logStore = new LogStore();

const log = console.log.bind(console);
console.log = (...args) => {
  logStore.addToLog({ origConsoleLog: log, limit: 100 }, ...args);
  log(...args);
};

const verbose = false;
const loginStore = new LoginStore();

const address = window.location.hostname;

const rpcRequestTimeout = 5500;
const store = new ConnectedStore(loginStore, {
  address,
  port,
  ssl: appHelper.ssl,
  protocol,
  protocolLane,
  rpcRequestTimeout,
  verbose,
  logStore
});

const metamaskConnect = metamaskInit(ethAddress => {
  console.log(`Connected ethereum address: ${ethAddress}`);
  loginStore.login(ethAddress);
});

const app = new App({
  target: document.body,
  props: {
    store,
    concurrency,
    appHelper,
    metamaskConnect
  }
});

export default app;
