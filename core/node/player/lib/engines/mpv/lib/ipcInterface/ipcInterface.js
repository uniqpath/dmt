import net from 'net';

import EventEmitter from 'events';

import cuid from '../cuid/index.js';

import ErrorHandler from '../error.js';
import ipcRequest from './ipcRequest.js';

import { log } from 'dmt/common';

class ipcInterface extends EventEmitter {
  constructor(options) {
    super();

    this.options = options;

    this.ipcRequests = {};

    this.errorHandler = new ErrorHandler();

    this.socket = new net.Socket();
  }

  init() {
    return new Promise((success, reject) => {
      this.socket.on('close', e => this.closeHandler(e));

      this.socket.on('error', error => {
        this.errHandler(error);
        reject();
      });

      this.socket.on('data', data => this.dataHandler(data));

      this.socket.connect({ path: this.options.socket }, () => {
        success();
      });
    });
  }

  command(command, args) {
    args = !args ? [] : args;
    const command_list = [command, ...args];
    return this.send(command_list);
  }

  setProperty(property, value) {
    const command_list = ['set_property', property, value];
    return this.send(command_list);
  }

  addProperty(property, value) {
    const command_list = ['add', property, value];
    return this.send(command_list);
  }

  multiplyProperty(property, value) {
    const command_list = ['multiply', property, value];
    return this.send(command_list);
  }

  getProperty(property) {
    const command_list = ['get_property', property];
    return this.send(command_list);
  }

  cycleProperty(property) {
    const command_list = ['cycle', property];
    return this.send(command_list);
  }

  freeCommand(command) {
    try {
      this.socket.write(`${command}\n`);
    } catch (error) {
      console.log(`ERROR: MPV is not running - tried so send the message '${command}' over socket '${this.options.socket}'`);
    }
  }

  destroy() {
    this.socket.removeAllListeners('close');
    this.socket.removeAllListeners('error');
    this.socket.removeAllListeners('data');

    clearTimeout(this.timepositionListenerId);

    this.socket.destroy();
  }

  send(command) {
    return new Promise((resolve, reject) => {
      const request_id = cuid();
      const messageJson = {
        command,
        request_id
      };

      log.debug(`Sending ipc command to mpv: ${JSON.stringify(messageJson, null, 2)}`, { cat: 'mpv-ipc' });

      if (this.socket.closed) {
        return reject(new Error('mpv socket is closed (is mpv process running?)'));
      }

      this.ipcRequests[request_id] = new ipcRequest(resolve, reject, Object.values(command).splice(1));
      try {
        this.socket.write(JSON.stringify(messageJson) + '\n');
      } catch (error) {
        return reject(this.errorHandler.errorMessage(7, message, 'send()', JSON.stringify(command)));
      }
    });
  }

  closeHandler(initial) {
    if (!initial) {
      this.emit('crashed');
    }
  }

  errHandler(error) {
    if (this.options.debug) {
      console.log(error);
    }
  }

  dataHandler(data) {
    const messages = data.toString().split('\n');

    messages.forEach(message => {
      if (message.length > 0) {
        const JSONmessage = JSON.parse(message);
        if ('request_id' in JSONmessage) {
          if (JSONmessage.error === 'success') {
            this.ipcRequests[JSONmessage.request_id].resolve(JSONmessage.data);
            delete this.ipcRequests[JSONmessage.request_id];
          } else {
            this.ipcRequests[JSONmessage.request_id].reject(JSONmessage.error);
            delete this.ipcRequests[JSONmessage.request_id];
          }
        } else {
          this.emit('message', JSON.parse(message));
        }
      }
    });
  }
}

export default ipcInterface;
