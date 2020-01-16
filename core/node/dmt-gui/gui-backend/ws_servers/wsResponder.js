const EventEmitter = require('events');
const dmt = require('dmt-bridge');
const os = require('os');

const { log } = dmt;

const { Server } = require('dmt-connect');

const reduceSizeOfStateForGUI = require('../reduceSizeOfStateForGUI');

const frameworkInternalActionReponses = require('./frameworkInternalActionReponses');

const constructAction = require('./constructAction');

function enumerateConnections({ server, program }, { announce = false } = {}) {
  program.updateState({ sysinfo: { connections: server.enumerateConnections() } }, { announce });
}

class WSResponder extends EventEmitter {
  init({ program, port }) {
    this.server = new Server();

    program.on('tick', () => {
      enumerateConnections({ server: this.server, program });
    });

    this.server.on('connection', channel => {
      log.debug(`NEW WS CONNECTION from ${channel.remoteIp}`, { cat: 'ws' });

      enumerateConnections({ server: this.server, program }, { announce: true });

      if (os.uptime() <= 60 && !channel.initialIdleViewLoad) {
        const { idleView } = dmt.services('gui');
        channel.initialIdleViewLoad = true;
        if (idleView) {
          setTimeout(() => {
            channel.send(constructAction({ action: 'load', storeName: 'gui', payload: idleView }));
          }, 500);
        }
      }

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

  parseMessage({ program, message, channel }) {
    const { action, storeName, payload } = JSON.parse(message || {});

    if (action && storeName) {
      if (!frameworkInternalActionReponses({ action, storeName, payload, program, channel, server: this.server })) {
        program.receiveAction({ action, storeName, payload });
      }
    } else {
      log.cyan(`Received unknown message: ${action}:${storeName}, payload: ${JSON.stringify(payload || {}, null, 2)}`);
    }
  }
}

module.exports = WSResponder;
