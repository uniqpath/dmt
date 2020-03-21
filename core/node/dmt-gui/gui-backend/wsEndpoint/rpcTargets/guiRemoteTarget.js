import EventEmitter from 'events';

import dmt from 'dmt-bridge';
const { log } = dmt;

class GuiTarget extends EventEmitter {
  constructor({ program }) {
    super();
    this.program = program;
  }

  action({ storeName, action, payload }) {
    if (action && storeName) {
      if (action == 'show_frontend_log') {
        this.program.updateState({ controller: { showFrontendLog: true } });
        return;
      }

      if (action == 'close_frontend_log') {
        this.program.removeStoreElement({ storeName: 'controller', key: 'showFrontendLog' });
        return;
      }

      this.program.receiveAction({ action, storeName, payload });
    } else {
      log.cyan(`Received unknown message: ${action}:${storeName}, payload: ${JSON.stringify(payload || {}, null, 2)}`);
    }
  }
}

export default GuiTarget;
