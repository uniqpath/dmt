import { log, isDevMachine } from 'dmt/common';

import EventEmitter from 'events';

import ping from './ping.js';

export default class ExecutePing extends EventEmitter {
  constructor({ program, target, prefix }) {
    super();

    if (!prefix) {
      throw new Error('Specify connectivity store prefix');
    }

    this.program = program;
    this.target = target;

    this.isConnected = undefined;

    this.deviceStore = program.slot('device');

    this.prefix = prefix;
  }

  cleanup() {
    const connectivityResumed = this.deviceStore.get(`${this.prefix}Resumed`);
    const connectivityResumedAt = this.deviceStore.get(`${this.prefix}ResumedAt`);

    if (connectivityResumed && Date.now() - connectivityResumedAt > 10 * 1000) {
      this.deviceStore.removeKeys([`${this.prefix}Resumed`, `${this.prefix}ResumedAt`], { announce: false });
    }
  }

  reset() {
    this.deviceStore.removeKeys([`${this.prefix}Resumed`, `${this.prefix}ResumedAt`, `${this.prefix}Problem`], { announce: false });

    this.isConnected = undefined;
  }

  assumeConnected() {
    this.isConnected = true;
  }

  ping() {
    return new Promise((success, reject) => {
      const target = this.target || this.deviceStore.get('gatewayIp');

      if (target) {
        if (this.program.hasValidIP()) {
          ping(target)
            .then(() => {
              if (this.isConnected == false) {
                if (this.deviceStore.get(`${this.prefix}Problem`)) {
                  const patch = {};
                  patch[`${this.prefix}Resumed`] = true;
                  patch[`${this.prefix}ResumedAt`] = Date.now();
                  this.deviceStore.update(patch, { announce: false });

                  this.emit('connection_resumed');
                }
              }

              this.deviceStore.removeKey(`${this.prefix}Problem`);

              this.isConnected = true;

              success();
            })
            .catch(e => {
              this.connectionLost(e.code);

              success();
            });
        } else {
          this.connectionLost();
          success();
        }
      } else {
        this.connectionLost('router unreachable');
        success();
      }
    });
  }

  connectionLost(code) {
    this.deviceStore.removeKeys([`${this.prefix}Resumed`, `${this.prefix}ResumedAt`], { announce: false });

    if (!this.deviceStore.get(`${this.prefix}Problem`)) {
      const patch = {};
      patch[`${this.prefix}Problem`] = true;
      this.deviceStore.update(patch);
    }

    if (this.isConnected) {
      this.emit('connection_lost', { code });
    }

    this.isConnected = false;
  }
}
