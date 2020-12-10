import * as dmtJS from '../../../../dmt-js';

import { MultiConnectedStore } from '../../../../connectome/src/stores';

import App from './App.svelte';

const port = 7780;
const protocol = 'dmt';
const lane = 'gui';

const connectToDeviceKey = localStorage.getItem('current_device_key');

console.log(`connectToDeviceKey: ${connectToDeviceKey}`);

const address = window.location.hostname;

const store = new MultiConnectedStore({ address, port, protocol, lane, connectToDeviceKey });

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
