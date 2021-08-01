import fs from 'fs';
import path from 'path';

import writeFileAtomic from './lib/writeFileAtomic.js';
import migrateState from './migrateState.js';

import compare from './lib/compare.js';

function dropState({ strState, stateFilePath, noRecovery }) {
  if (!noRecovery && strState?.trim() != '') {
    const extname = path.extname(stateFilePath);

    const backupFilePath = stateFilePath.replace(new RegExp(`${extname}$`), `-recovery-${Date.now()}${extname}`);

    fs.writeFileSync(backupFilePath, strState);
  }
}

function saveState({ stateFilePath, schemaVersion, state, lastSavedState }) {
  // we record schemaVersion in data if utilizing it in the first place
  if (schemaVersion) {
    state.schemaVersion = schemaVersion;
  }

  if (!lastSavedState || !compare(lastSavedState, state)) {
    writeFileAtomic(stateFilePath, JSON.stringify(state, null, 2), err => {
      if (err) throw err;
    });

    return state;
  }
}

function loadState({ stateFilePath, schemaVersion, schemaMigrations = [], noRecovery = false }) {
  if (fs.existsSync(stateFilePath)) {
    const strState = fs.readFileSync(stateFilePath).toString();

    try {
      const loadedState = JSON.parse(strState);

      if (schemaVersion) {
        if (!loadedState.schemaVersion) {
          return dropState({ strState, stateFilePath, noRecovery });
        }

        if (loadedState.schemaVersion != schemaVersion) {
          const migratedState = migrateState({ state: loadedState, schemaVersion, schemaMigrations });

          return migratedState || dropState({ strState, stateFilePath, noRecovery });
        }
      } else if (loadedState.schemaVersion) {
        return dropState({ strState, stateFilePath, noRecovery });
      }

      return loadedState;
    } catch (e) {
      return dropState({ strState, stateFilePath, noRecovery });
    }
  }
}

export { saveState, loadState };
