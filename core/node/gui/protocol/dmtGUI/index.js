import { log, colors, isDevMachine } from 'dmt/common';

import loadGuiViewsDef from '../../viewsDef/loadGuiViewsDef.js';

import handleErrorFromGui from './helpers/handleErrorFromGui.js';

import onConnect from './onConnect.js';

const dmtID = 'dmt';
const protocol = 'gui';

export default function initProtocol({ program }) {
  const channels = program.dev(dmtID).registerProtocol(protocol, onConnect);

  program.store().sync(channels);

  if (isDevMachine()) {
    log.magenta('⚠️  Reminder: remove this GUITarget after dmt gui moves to Svelte3');
  }

  program
    .dev(dmtID)
    .protocol(protocol)
    .onUserAction('gui/errors', ({ payload }) => {
      handleErrorFromGui(payload);
    });

  program
    .dev(dmtID)
    .protocol(protocol)
    .onUserAction('gui/show_frontend_log', () => {
      program.slot('device').update({ showFrontendLog: true });
    });

  program
    .dev(dmtID)
    .protocol(protocol)
    .onUserAction('gui/close_frontend_log', () => {
      program.slot('device').removeKey('showFrontendLog');
    });

  program
    .dev(dmtID)
    .protocol(protocol)
    .scope('device')
    .onUserAction(({ action, scope }) => {
      log.yellow(`Received ${colors.magenta(scope)}:${colors.cyan(action)} action`);
      program.api('device').call(action);
    });

  program
    .dev(dmtID)
    .protocol(protocol)
    .onUserAction(({ scope, action, payload }) => {
      if (scope != 'gui') {
        log.gray(`Received user action ${colors.cyan(scope)}::${colors.green(action)}`);
        if (payload) {
          log.gray('Payload: ', JSON.stringify(payload, null, 2));
        }
      }
    });

  program.on('send_to_connected_guis', ({ action, payload }) => {
    log.cyan(
      `Received request to send action ${colors.magenta(`gui:${action}`)} to frontend${
        payload ? `${colors.cyan(' with payload')} ${colors.yellow(payload)}` : ''
      }`
    );

    if (action == 'reload') {
      loadGuiViewsDef(program);

      program.emit('gui:reload');
    }

    channels.signalAll('frontend_action', { action, payload });
  });
}
