import { generateJsonPatch } from '../util/index.js';

function getDiff({ state, prevAnnouncedState }) {
  const diff = generateJsonPatch(prevAnnouncedState, state);

  if (diff.length > 0) {
    return diff;
  }
}

export default getDiff;
