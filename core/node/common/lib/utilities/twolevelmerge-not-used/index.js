import compare from '../just/collection-compare/index.js';

export default merge;

function merge(state, patch) {
  let somethingChanged = false;

  for (const key of Object.keys(patch)) {
    if (!compare(state[key], patch[key])) {
      if (patch[key]) {
        for (const subkey of Object.keys(patch[key])) {
          if (!state[key] || !compare(state[key][subkey], patch[key][subkey])) {
            state[key] = state[key] || {};
            state[key][subkey] = patch[key][subkey];
            somethingChanged = true;
          }
        }
      }
    }
  }
  return somethingChanged;
}
