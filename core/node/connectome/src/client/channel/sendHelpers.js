function isObject(obj) {
  return obj !== undefined && obj !== null && obj.constructor == Object;
}

function addHeader(_msg, flag) {
  const msg = new Uint8Array(_msg.length + 1);

  const header = new Uint8Array(1);
  header[0] = flag;

  msg.set(header);
  msg.set(_msg, header.length);

  return msg;
}

export { isObject, addHeader };
