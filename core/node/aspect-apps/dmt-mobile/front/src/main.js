import { stores } from 'dmt-js';
const { SessionStore, MultiConnectedStore } = stores;

import App from './App.svelte';

const port = 7780;
const protocol = 'dmt';
const protocolLane = 'gui';

const session = new SessionStore();
const store = new MultiConnectedStore({ session, port, protocol, protocolLane, initialIp: null });

const app = new App({
  target: document.body,
  props: {
    store,
    session
  }
});

export default app;
