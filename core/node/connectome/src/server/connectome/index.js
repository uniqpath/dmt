import WsServer from './wsServer.js';
import initializeConnection from './initializeConnection.js';

import ReadableStore from '../../stores/lib/helperStores/readableStore.js';

import { orderBy } from '../../utils/sorting/sorting.js';

import ChannelList from '../channel/channelList.js';

import { newKeypair } from '../../utils/crypto/index.js';

export default class Connectome extends ReadableStore {
  constructor({ port, keypair = newKeypair(), server, log = console.log, verbose }) {
    super({ connectionList: [] });

    this.port = port;
    this.keypair = keypair;

    this.server = server;

    this.log = log;
    this.verbose = verbose;

    this.protocols = {};
  }

  constructOldProtocolHandle(dmtID, protocol) {
    return protocol ? `${dmtID}/${protocol}` : dmtID;
  }

  dev(dmtID) {
    return this.developer(dmtID);
  }

  developer(dmtID) {
    const userAction = ({ dmtID, protocol, scope, action, payload, channel }) => {
      const handle = this.constructOldProtocolHandle(dmtID, protocol);

      const a = (this.userActionHandlers || {})[handle] || {};
      for (const [scopeAndAction, handlers] of Object.entries(a)) {
        const [_scope, _action] = scopeAndAction.split('/');
        if (!_scope || (_scope == scope && (!_action || _action == action))) {
          handlers.forEach(handler => handler({ scope, action, payload, channel }));
        }
      }
    };

    return {
      registerProtocol: (protocol, onConnect = () => {}) => {
        const onConnectWrap = ({ channel }) => {
          channel.on('__action', ({ action, payload, scope }) => {
            userAction({ dmtID, protocol, scope, action, payload, channel });
          });

          channel.on('action', ({ action, payload, scope }) => {
            userAction({ dmtID, protocol, scope, action, payload, channel });
          });

          onConnect({ program: this, channel });
        };

        return this.__registerProtocol({
          protocol: this.constructOldProtocolHandle(dmtID, protocol),
          onConnect: onConnectWrap
        });
      },

      protocol: _protocol => {
        const handle = this.constructOldProtocolHandle(dmtID, _protocol);

        const onUserAction = (scopeAndAction, handler) => {
          if (!handler && typeof scopeAndAction == 'function') {
            handler = scopeAndAction;
            scopeAndAction = '';
          }

          this.userActionHandlers = this.userActionHandlers || {};
          this.userActionHandlers[handle] = this.userActionHandlers[handle] || {};
          this.userActionHandlers[handle][scopeAndAction] = this.userActionHandlers[handle][scopeAndAction] || [];
          this.userActionHandlers[handle][scopeAndAction].push(handler);

          const MAX_HANDLERS = 200;

          const numHandlers = Object.keys(this.userActionHandlers).length;

          if (numHandlers > MAX_HANDLERS) {
            const msg = `⚠️ Too many user action handlers (${numHandlers}). Is this a memory leak?`;
            console.log(msg);

            if (numHandlers > 1.5 * MAX_HANDLERS) {
              throw new Error(msg);
            }
          }
        };

        const scope = scope => {
          return {
            onUserAction: (action, handler) => {
              if (!handler) {
                handler = action;
                onUserAction(scope, handler);
              } else {
                onUserAction(`${scope}/${action}`, handler);
              }
            }
          };
        };

        return { onUserAction, scope };
      }
    };
  }

  __registerProtocol({ protocol, onConnect = () => {} }) {
    if (this.wsServer) {
      throw new Error('registerProtocol: Please add all protocols before starting the ws server.');
    }

    this.emit('protocol_added', { protocol });

    if (!this.protocols[protocol]) {
      const channelList = new ChannelList({ protocol });
      this.protocols[protocol] = { onConnect, channelList };
      return channelList;
    }

    throw new Error(`Protocol ${protocol} already exists`);
  }

  start() {
    this.wsServer = new WsServer({
      port: this.port,
      log: this.log,
      verbose: this.verbose,
      server: this.server
    });

    this.wsServer.on('connection', channel => {
      initializeConnection({ server: this, channel });
    });

    this.on('connection', () => {
      this.publishState();
    });

    this.wsServer.on('connection_closed', channel => {
      this.emit('connection_closed', channel);
      this.publishState();
    });
  }

  publishState() {
    const connectionList = this.connectionList();

    connectionList.forEach(connection => {
      delete connection.lastMessageAt;
      delete connection.readyState;
    });

    this.state = { connectionList };
    this.announceStateChange();
  }

  registeredProtocols() {
    return Object.keys(this.protocols);
  }

  connectionList() {
    const list = this.wsServer.enumerateConnections().reverse();
    const order = orderBy('protocol');
    return list.sort(order);
  }
}
