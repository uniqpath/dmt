import fs from 'fs';
import writeFileAtomic from 'write-file-atomic';

import dmt from 'dmt/bridge';
const { log, util } = dmt;

const { compare } = util;

import cleanupStateOnSave from './cleanupStateOnSave';

const STATE_SCHEMA_VERSION = 0.8;

function saveState({ state, lastSavedState, stateFilePath = dmt.programStateFile } = {}) {
  const _state = cleanupStateOnSave(state);

  _state.schemaVersion = STATE_SCHEMA_VERSION;

  if (!lastSavedState || !compare(lastSavedState, _state)) {
    writeFileAtomic(stateFilePath, JSON.stringify(_state, null, 2), err => {
      if (err) throw err;
      return _state;
    });
  }
}

function loadState({ stateFilePath = dmt.programStateFile } = {}) {
  if (fs.existsSync(stateFilePath)) {
    try {
      const loadedState = JSON.parse(fs.readFileSync(stateFilePath));

      if (loadedState.schemaVersion == STATE_SCHEMA_VERSION) {
        return loadedState;
      }

      log.red('Rare event of schemaVersion bump: Ignoring persisted program state!');
    } catch (e) {
      log.red('⚠️  Discarding invalid persisted state, starting with a clean state.');
      log.red(e);
    }
  } else {
    log.yellow(`${stateFilePath} was not present, starting with a clean state.`);
  }

  return {};
}

export { saveState, loadState };
