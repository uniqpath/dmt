import fs from 'fs';
import writeFileAtomic from 'write-file-atomic';

import dmt from 'dmt/bridge';
const { log } = dmt;

import { clone, compare } from '../../util';

import cleanupStateOnSave from './cleanupStateOnSave';

const STATE_SCHEMA_VERSION = 0.8;

function saveState({ state, lastSavedState, stateFilePath }) {
  const _state = cleanupStateOnSave(clone(state));

  _state.schemaVersion = STATE_SCHEMA_VERSION;

  if (!lastSavedState || !compare(lastSavedState, _state)) {
    writeFileAtomic(stateFilePath, JSON.stringify(_state, null, 2), err => {
      if (err) throw err;
      return _state;
    });
  }
}

function readState({ stateFilePath }) {
  if (fs.existsSync(stateFilePath)) {
    try {
      const loadedState = JSON.parse(fs.readFileSync(stateFilePath));

      if (loadedState.schemaVersion == STATE_SCHEMA_VERSION) {
        return loadedState;
      }

      log.red('Rare event of schemaVersion bump: Ignoring persisted program state!.');
    } catch (e) {
      log.debug('Discarding invalid persisted state');
    }
  }

  return {};
}

export { saveState, readState };
