import * as dmtJS from '../../../../dmt-js';

import { stores } from '../../../../connectome';
const { MultiConnectedStore } = stores;

import App from './App.svelte';

const port = 7780;
const protocol = 'dmt';
const protocolLane = 'gui';

const connectToDeviceKey = localStorage.getItem('current_device_key');

console.log(`connectToDeviceKey: ${connectToDeviceKey}`);

const ip = window.location.hostname;

const store = new MultiConnectedStore({ ip, port, protocol, protocolLane, connectToDeviceKey });

store.on('connect_to_device_key_failed', () => {
  console.log('connect_to_device_key_failed FAILED');
  localStorage.removeItem('current_device_key');
});

const app = new App({
  target: document.body,
  props: {
    store,
    dmtJS
  }
});

export default app;
