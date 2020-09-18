import EventEmitter from 'events';

import dmt from 'dmt/bridge';
const { log } = dmt;

class GuiTarget extends EventEmitter {
  constructor({ program }) {
    super();
    this.program = program;
  }

  action({ namespace, action, payload }) {
    if (action && namespace) {
      if (action == 'show_frontend_log') {
        this.program.store.update({ device: { showFrontendLog: true } });
        return;
      }

      if (action == 'close_frontend_log') {
        this.program.store.removeSlotElement({ slotName: 'device', key: 'showFrontendLog' });
        return;
      }

      this.program.emit('dmt_gui_action', { action, namespace, payload });
    } else {
      log.cyan(`Received unknown message: ${action}:${namespace}, payload: ${JSON.stringify(payload || {}, null, 2)}`);
    }
  }
}

export default GuiTarget;
