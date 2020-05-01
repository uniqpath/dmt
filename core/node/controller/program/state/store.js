import path from 'path';
import fs from 'fs';
import retrace from 'retrace';

import dmt from 'dmt/bridge';
const { util, stopwatch, log } = dmt;

import { reduceSizeOfStateForGUI } from 'dmt/gui';
import removeStateChangeFalseTriggers from './removeStateChangeFalseTriggers';

import UpdateState from './updateState';
import SaveLoadState from './saveLoadState';

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
    const stateClone = stopwatch.measureHelper(() => reduceSizeOfStateForGUI(util.clone(this.program.state)), { desc: 'cloning state', disable: true });
    removeStateChangeFalseTriggers(stateClone);
    const diff = stopwatch.measureHelper(() => util.generateJsonPatch(this.prevAnnouncedState, stateClone), { desc: 'creating state diff', disable: true });

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
    const sourceMapPath = path.join(dmt.dmtPath, 'core/node/gui/gui-frontend-core/app/public/bundle.js.map');

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

export default Store;
