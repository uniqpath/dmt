import { util, dmtHerePath } from 'dmt/common';

import { SyncStore } from 'dmt/connectome-stores';

const { mkdirp } = util;

function getStateDirectory(dir) {
  const _dir = `${dmtHerePath}/state/${dir}`;
  mkdirp(_dir);
  return _dir;
}

const stores = {};

function createStore(handle, initState, opts = {}) {
  if (stores[handle]) {
    throw new Error(`Store with handle=${handle} has already been created!`);
  }

  const parts = handle.split('/');
  const dir = parts[0];
  const file = `${parts[1] || 'store'}.json`;
  const stateFilePath = `${getStateDirectory(dir)}/${file}`;

  const store = new SyncStore(initState, { ...opts, stateFilePath });

  stores[handle] = store;

  return store;
}

function getStore(handle) {
  const store = stores[handle];

  if (!store) {
    throw new Error(`Store with handle=${handle} has not yet been created!`);
  }

  return store;
}

export { createStore, getStore, stores };
