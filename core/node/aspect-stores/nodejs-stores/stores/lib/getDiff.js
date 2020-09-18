import { generateJsonPatch } from '../../util';

function getDiff({ state, prevAnnouncedState }) {
  const diff = generateJsonPatch(prevAnnouncedState, state);

  if (diff.length > 0) {
    return diff;
  }
}

export default getDiff;
