function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

function isObjectObject(o) {
  return isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor, prot;

  if (isObjectObject(o) === false) return false;

  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  return true;
};
