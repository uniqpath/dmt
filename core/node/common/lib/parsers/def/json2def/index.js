// source: https://github.com/Anyass3/dmt-defJson

const _def2json = def => {
  let slices = [];
  def.forEach((item, index) => {
    if (item.match(/^[^\s].*/)) {
      slices.push(index);
    }
  });

  slices = slices.map((s, idx) => [s, slices[idx + 1]]);

  return slices.reduce((prev, current) => {
    let sliced = def.slice(current[0] + 1, current[1]);
    const item = def[current[0]]
      .split(':')
      .map(i => i.trim())
      .filter(i => i);
    sliced = sliced.map(i => i.replace(/^(\s{2})/, ''));
    let json = {};
    if (sliced?.length) {
      if (item.length === 2) {
        json[item[0]] = [{ id: item[1], ..._def2json(sliced) }];
      } else {
        json[item[0]] = [_def2json(sliced)];
      }
    } else if (item.length === 2) {
      json[item[0]] = item[1];
    }
    return Object.keys(json).reduce((subprev, key) => {
      let obj;
      if (subprev?.[key]) {
        obj = { [key]: json[key].concat(subprev[key]) };
      } else obj = { [key]: json[key] };
      return { ...subprev, ...obj };
    }, prev);
  }, []);
};

const _json2def = (_json, space = '') => {
  const { id, ...json } = _json;
  return Object.keys(json).reduce((prevs, key) => {
    const __def__ = space + key + ': ';
    if (typeof json[key] === 'string') return prevs + __def__ + json[key] + '\n\n';
    else {
      return json[key].reduceRight((prev, item) => prev + (__def__ + (item.id || '')).trimEnd() + '\n\n' + _json2def(item, space + '  '), prevs);
    }
  }, '');
};

export function def2json(def) {
  def = def
    .replace(/#.*/g, '')
    .split('\n')
    .filter(i => i && !/^\s*$/.exec(i))
    .map(i => i.trimEnd());
  return _def2json(def);
}

export function json2def(json) {
  if (typeof json === 'string') json = JSON.parse(json);
  return _json2def(json);
}
