function constructTryer(obj) {
  return accessor => {
    let current = obj;

    for (const nextKey of accessor.split('.')) {
      const re = new RegExp(/(\S*)\[['"]?(\S*?)['"]?\]/);
      const matches = nextKey.match(re);
      if (matches) {
        const nextDict = matches[1];
        const _nextKey = matches[2];
        current = listify(current[nextDict]).find(el => id(el) == _nextKey);
      } else {
        current = current[nextKey];
      }

      if (typeof current == 'undefined') {
        return undefined;
      }
    }

    return current;
  };
}

function tryOnTheFly(obj, accessor) {
  return constructTryer(obj)(accessor);
}

function makeTryable(obj) {
  if (!obj) {
    obj = {};
  }

  obj.try = constructTryer(obj);

  return obj;
}

function id(obj) {
  return values(obj)[0];
}

function values(obj) {
  return listify(obj).map(el => el.id);
}

function listify(obj) {
  if (typeof obj == 'undefined' || obj == null) {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj;
  }
  if (typeof obj == 'string') {
    return [{ id: obj }];
  }
  return [obj];
}

export default { makeTryable, tryOnTheFly, id, values, listify };
