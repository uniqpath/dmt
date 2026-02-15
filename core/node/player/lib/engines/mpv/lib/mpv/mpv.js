import EventEmitter from 'events';

import commandModule from './_commands.js';
import controlModule from './_controls.js';
import eventModule from './_events.js';
import playlistModule from './_playlist.js';
import IpcInterface from '../ipcInterface/ipcInterface.js';

import { log } from 'dmt/common';

import util from '../util.js';
import ErrorHandler from '../error.js';

export default class mpv extends EventEmitter {
  constructor(options, mpv_args) {
    super();
    this.options = util.mergeDefaultOptions(options);

    this.mpv_arguments = util.mpvArguments(this.options, mpv_args);

    this.observed = util.observedProperties(this.options.audio_only);

    this.observedIDs = {};

    this.currentTimePos = null;

    this.running = false;

    this.errorHandler = new ErrorHandler();
  }

  connect() {
    return new Promise((success, reject) => {
      util
        .findIPCCommand(this.options)
        .then(({ ipcCommand, mpvVersion }) => {
          return new Promise((success, reject) => {
            this.mpv_arguments.push(`${ipcCommand}=${this.options.socket}`);

            success({ mpvVersion });
          });
        })
        .then(({ mpvVersion }) => {
          this.ipc = new IpcInterface(this.options);

          this.ipc.on('crashed', () => {
            this.emit('crashed');
            this.ipc.destroy();
            this.running = false;
          });

          this.ipc
            .init()
            .then(() => {
              this.ipc.command('observe_property', [0, 'time-pos']);
              this.ipc.command('observe_property', [1, 'percent-pos']);

              const handler = () => {
                if (this.observed.filename && !this.observed.pause && this.currentTimePos != null) {
                  this.emit('timeposition', { seconds: this.currentTimePos, percent: this.currentPercentPos });
                }

                this.timepositionListenerId = setTimeout(handler, this.options.time_update * 500);
              };

              handler();

              let id = 2;
              Object.keys(this.observed).forEach(property => {
                if (property in this.observed) {
                  this.observeProperty(property, id);
                  this.observedIDs[id] = property;
                  id += 1;
                }
              });

              this.ipc.on('message', message => this.messageHandler(message));

              this.running = true;

              success({ mpvVersion });
            })
            .catch(() => {
              reject(new Error('cannot_connect_to_mpv_process'));
            });
        })
        .catch(() => {
          reject(new Error('mpv_not_available'));
        });
    });
  }

  isRunning() {
    return this.running;
  }

  load(file, mode = 'replace', options) {
    return new Promise((resolve, reject) => {
      this.ipc
        .command('loadfile', options ? [file, mode].concat(util.formatOptions(options)) : [file, mode])
        .then(resolve)
        .catch(reject);
    });
  }
}

Object.assign(mpv.prototype, controlModule, commandModule, eventModule, playlistModule);
