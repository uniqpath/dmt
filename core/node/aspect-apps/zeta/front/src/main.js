import * as dmtJS from '../../../../dmt-js';
import { stores, concurrency } from '../../../../connectome/src/client';

import { writable } from 'svelte/store';

const { metamask } = dmtJS;

import appHelper from './appHelper';

appHelper.deps = { dmtJS };

const { LogStore } = stores;

const { metamaskInit } = metamask;

import App from './App.svelte';

const port = appHelper.ssl ? '/ws' : 7780;
const protocol = 'zeta';
const lane = 'gui';

const logStore = new LogStore();

const log = console.log.bind(console);
console.log = (...args) => {
  logStore.addToLog({ origConsoleLog: log, limit: 100 }, ...args);
  log(...args);
};

const verbose = false;
const address = window.location.hostname;

const rpcRequestTimeout = 5500;
const store = new stores.ConnectedStore({
  address,
  port,
  ssl: appHelper.ssl,
  protocol,
  lane,
  rpcRequestTimeout,
  verbose
});

const loginStore = writable({});

const metamaskConnect = metamaskInit(ethAddress => {
  console.log(`Connected ethereum address: ${ethAddress}`);

  loginStore.set({ ethAddress });
});

const app = new App({
  target: document.body,
  props: {
    store,
    loginStore,
    concurrency,
    appHelper,
    metamaskConnect
  }
});

export default app;
