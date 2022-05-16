import { deepmerge } from './util/index.js';

function mergeState(state, patch) {
  const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
  return deepmerge(state, patch, { arrayMerge: overwriteMerge });
}

export default mergeState;
