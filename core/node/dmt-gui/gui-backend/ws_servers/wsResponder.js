const EventEmitter = require('events');
const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const { Server } = require('dmt-connect');

const constructAction = require('./constructAction');

const loadGuiViewsDef = require('../../loadGuiViewsDef');

const reduceSizeOfStateForGUI = require('../reduceSizeOfStateForGUI');

class WSResponder extends EventEmitter {
  init({ program, port }) {
    this.server = new Server();

    this.server.on('connection', channel => {
      log.debug(`NEW WS CONNECTION from ${channel.remoteIp}`, { cat: 'ws' });

      const state = { ...reduceSizeOfStateForGUI(program.state), ...{ integrations: undefined } };
      channel.send(JSON.stringify({ state }));

      channel.on('message', message => {
        this.parseMessage({ program, message, channel });
      });
    });

    this.server.init({ port });

    this.programStateChangeSetup(program);
  }

  programStateChangeSetup(program) {
    program.on('state_diff', ({ diff }) => {
      this.server.sendAllChannels(JSON.stringify({ diff }));
    });
  }

  integrationsStateChangeSetup({ program, channel }) {
    function sendIntegrationsState() {
      if (program.state.integrations) {
        channel.send(JSON.stringify({ integrations: program.state.integrations }));
      }
    }

    const name = 'integrations_state_updated';

    const callback = () => {
      if (channel.closed()) {
        program.removeListener(name, callback);
      } else {
        sendIntegrationsState();
      }
    };

    program.on(name, callback);

    sendIntegrationsState();
  }

  parseMessage({ program, message, channel }) {
    const { action, storeName, payload } = JSON.parse(message || {});
    if (action && storeName) {
      if (storeName == 'gui') {
        log.cyan(
          `Received request to send action ${colors.magenta(`gui:${action}`)} to frontend${
            payload ? `${colors.cyan(' with payload')} ${colors.yellow(payload)}` : ''
          }`
        );

        if (action == 'reload') {
          loadGuiViewsDef(program);
        }

        this.server.sendAllChannels(constructAction({ action, storeName, payload }));
      } else if (storeName == 'rpc') {
        program.emit('ws_api_request', { action, payload, channel });
      } else if (storeName == 'connection' && action == 'local_ws') {
        this.integrationsStateChangeSetup({ program, channel });
      } else {
        program.receiveAction({ action, storeName, payload });
      }
    } else {
      log.cyan(`Received unknown message: ${action}:${storeName}, payload: ${JSON.stringify(payload || {}, null, 2)}`);
    }
  }
}

module.exports = WSResponder;
