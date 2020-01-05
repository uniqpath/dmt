const path = require('path');
const fs = require('fs');
const retrace = require('retrace');
const dmt = require('dmt-bridge');
const { util, log } = dmt;

const { reduceSizeOfStateForGUI } = require('dmt-gui');
const removeStateChangeFalseTriggers = require('./removeStateChangeFalseTriggers');

const UpdateState = require('./updateState');
const SaveLoadState = require('./saveLoadState');

class Store {
  constructor(program, { initState }) {
    dmt.includeModule(this, UpdateState);
    dmt.includeModule(this, SaveLoadState);

    this.program = program;

    this.prevAnnouncedState = {};
    program.state = program.state || {};

    this.initStatePhase = true;

    this.reloadState();
    this.updateState(initState);

    this.initStatePhase = false;
  }

  announceStateChange() {
    const stateClone = util.measure(() => reduceSizeOfStateForGUI(util.clone(this.program.state)), { desc: 'cloning state', disable: true });
    removeStateChangeFalseTriggers(stateClone);
    const diff = util.measure(() => util.generateJsonPatch(this.prevAnnouncedState, stateClone), { desc: 'creating state diff', disable: true });

    if (diff.length > 0) {
      this.persistState();

      this.emitStateChangedEvent(diff);
      this.prevAnnouncedState = stateClone;
    }
  }

  emitStateChangedEvent(diff) {
    this.program.emit('state_diff', { diff });
  }

  receiveAction({ action, storeName, payload }) {
    if (storeName == 'gui_errors') {
      this.handleErrorFromGui(payload);
      return;
    }

    if (action && storeName) {
      this.program.emit('action', { action, storeName, payload });
    } else {
      log.red(`Received invalid action: ${storeName}:${action}`);
    }
  }

  handleErrorFromGui(stacktrace) {
    const sourceMapPath = path.join(dmt.dmtPath, 'core/node/dmt-gui/gui-frontend-core/app/public/bundle.js.map');

    if (fs.existsSync(sourceMapPath)) {
      retrace.register(null, fs.readFileSync(sourceMapPath));

      retrace
        .map(stacktrace)
        .then(mappedStack => {
          log.error(`Gui error in browser: ${mappedStack}`);
        })
        .catch(err => {
          log.cyan(`Something went wrong while trying to map sourcemaps ${err}`);
          log.error(`Original gui error in browser: ${stacktrace}`);
        });
    } else {
      log.error(`Gui error in browser: ${stacktrace}`);
    }
  }
}

module.exports = Store;
