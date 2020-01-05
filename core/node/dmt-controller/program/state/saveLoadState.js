const fs = require('fs');

const dmt = require('dmt-bridge');
const { util, log } = dmt;

const { cleanupStateOnLoad, cleanupStateOnSave } = require('./cleanupState');

const STATE_SCHEMA_VERSION = 0.8;

class SaveLoadState {
  persistState() {
    const state = cleanupStateOnSave(util.clone(this.program.state));

    state.schemaVersion = STATE_SCHEMA_VERSION;

    if (!this.lastPersistedState || !util.compare(this.lastPersistedState, state)) {
      fs.writeFileSync(dmt.programStateFile, JSON.stringify(state, null, 2));
      this.lastPersistedState = state;
    }
  }

  reloadState() {
    if (fs.existsSync(dmt.programStateFile)) {
      try {
        const loadedState = cleanupStateOnLoad(JSON.parse(fs.readFileSync(dmt.programStateFile)));
        if (loadedState.schemaVersion == STATE_SCHEMA_VERSION) {
          this.updateState(loadedState);
        } else {
          log.red('Rare event of schemaVersion bump: Ignoring persisted program state!.');
        }
      } catch (e) {
        log.debug('Discarding invalid persisted state');
      }
    }
  }
}

module.exports = SaveLoadState;
