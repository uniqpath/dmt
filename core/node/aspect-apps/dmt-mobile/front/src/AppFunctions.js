function storeAction({ store, action, payload }) {
  console.log(`Action: ${action}`);

  store.action({ action, namespace: 'player', payload });
}

function switchDevice({ store, device }) {
  localStorage.setItem('current_device_key', device.deviceKey);
  store.switch(device);
}

export { storeAction, switchDevice };
