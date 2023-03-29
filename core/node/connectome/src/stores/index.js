import MultiConnectedStore from './lib/multiConnectedStore/multiConnectedStore.js';

function isEmptyObject(obj) {
  return typeof obj === 'object' && Object.keys(obj).length === 0;
}

export { MultiConnectedStore, isEmptyObject };
