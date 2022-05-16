import { generateJsonPatch } from './util/index.js';

function getDiff(prevAnnouncedState, currentState) {
  const diff = generateJsonPatch(prevAnnouncedState, currentState);

  if (diff.length > 0) {
    return diff;
  }
}

export default getDiff;
