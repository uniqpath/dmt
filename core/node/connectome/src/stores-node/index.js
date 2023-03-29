import SyncStore from './syncStore.js';

import MultiConnectedStore from '../stores/lib/multiConnectedStore/multiConnectedStore.js';

function isEmptyObject(obj) {
  return typeof obj === 'object' && Object.keys(obj).length === 0;
}

export { SyncStore, MultiConnectedStore, isEmptyObject };
