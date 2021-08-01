import fs from 'fs';
import writeFileAtomic from 'write-file-atomic';

import dmt from 'dmt/common';
const { log, util } = dmt;

const { compare } = util;

import rfc6902 from 'rfc6902';
const generateJsonPatch = rfc6902.createPatch;

const STATE_SCHEMA_VERSION = 0.8;

function saveState({ state, lastSavedState, stateFilePath = dmt.programStateFile } = {}) {
  state.schemaVersion = STATE_SCHEMA_VERSION;

  if (!lastSavedState || !compare(lastSavedState, state)) {
    writeFileAtomic(stateFilePath, JSON.stringify(state, null, 2), err => {
      if (err) throw err;
    });

    return state;
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
}

export { saveState, loadState };
