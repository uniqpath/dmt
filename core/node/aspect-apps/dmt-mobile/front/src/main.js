import { stores } from 'dmt-js';
const { SessionStore, MultiConnectedStore } = stores;

import App from './App.svelte';

const port = 7780;
const protocol = 'dmt';
const protocolLane = 'gui';

const initialIp = localStorage.getItem('current_device_ip');

const session = new SessionStore();
const store = new MultiConnectedStore({ session, port, protocol, protocolLane, initialIp });

const app = new App({
  target: document.body,
  props: {
    store,
    session
  }
});

export default app;
