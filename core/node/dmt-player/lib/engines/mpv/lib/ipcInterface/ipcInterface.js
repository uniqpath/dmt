const net = require('net');
const eventEmitter = require('events').EventEmitter;
const cuid = require('../cuid');

const eventsModule = require('./_events');
const ErrorHandler = require('../error');
const ipcRequest = require('./ipcRequest');

const dmt = require('dmt-bridge');
const { log } = dmt;

function ipcInterface(options) {
  this.options = options;

  this.ipcRequests = {};

  this.errorHandler = new ErrorHandler();

  eventEmitter.call(this);

  this.socket = new net.Socket();
}

function init() {
  return new Promise((success, reject) => {
    this.socket.connect({ path: this.options.socket }, () => {
      success();
    });

    this.socket.on('close', () => this.closeHandler());

    this.socket.on('error', error => {
      this.errHandler(error);
      reject();
    });

    this.socket.on('data', data => this.dataHandler(data));
  });
}

ipcInterface.prototype = Object.assign(
  {
    constructor: ipcInterface,
    init,
    command(command, args) {
      args = !args ? [] : args;
      const command_list = [command, ...args];
      return this.send(command_list);
    },
    setProperty(property, value) {
      const command_list = ['set_property', property, value];
      return this.send(command_list);
    },
    addProperty(property, value) {
      const command_list = ['add', property, value];
      return this.send(command_list);
    },
    multiplyProperty(property, value) {
      const command_list = ['multiply', property, value];
      return this.send(command_list);
    },
    getProperty(property) {
      const command_list = ['get_property', property];
      return this.send(command_list);
    },
    cycleProperty(property) {
      const command_list = ['cycle', property];
      return this.send(command_list);
    },
    freeCommand(command) {
      try {
        this.socket.write(`${command}\n`);
      } catch (error) {
        console.log(`ERROR: MPV is not running - tried so send the message '${message}' over socket '${this.options.socket}'`);
      }
    },
    quit() {
      this.socket.removeAllListeners('close');
      this.socket.removeAllListeners('error');
      this.socket.removeAllListeners('data');
      this.socket.destroy();
    },
    send(command) {
      return new Promise((resolve, reject) => {
        const request_id = cuid();
        const messageJson = {
          command,
          request_id
        };

        log.debug(`Sending ipc command to mpv: ${JSON.stringify(messageJson, null, 2)}`, { cat: 'mpv-ipc' });

        this.ipcRequests[request_id] = new ipcRequest(resolve, reject, Object.values(command).splice(1));
        try {
          this.socket.write(JSON.stringify(messageJson) + '\n');
        } catch (error) {
          return reject(this.errorHandler.errorMessage(7, message, 'send()', JSON.stringify(command)));
        }
      });
    }
  },
  eventsModule,
  eventEmitter.prototype
);

module.exports = ipcInterface;
