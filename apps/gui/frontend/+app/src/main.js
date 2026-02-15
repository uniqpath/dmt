import App from './App.html';

import { ConnectedStore, MultiConnectedStore } from '../../+legacyLib/index.js';

// doing just const store = new ConnectedStore() probably doesn't work anymore... (but it should be a small fix!! -- not that anyone would want that but still!! Multi-connected stores are great.)
const store = new MultiConnectedStore();

// source: https://stackoverflow.com/a/9216488
const log = console.log.bind(console);
console.log = (...args) => {
  store.addToFrontendLog(...args);
  log(...args);
};

const app = new App({
  target: document.body,
  store
});

window.store = store;

export default app;
