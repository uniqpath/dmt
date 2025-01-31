import notify from './sending/notify.js';

async function notifyAll(obj) {
  return notify({ ...obj, notifyAll: true });
}

export { notify, notifyAll };
