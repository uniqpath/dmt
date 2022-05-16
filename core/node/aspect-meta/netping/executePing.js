import EventEmitter from 'events';

import { log, stopwatch, colors, isMainDevice, isDevUser, device, apMode } from 'dmt/common';

import ping from './ping';

export default class ExecutePing extends EventEmitter {
  constructor({ program, target, prefix }) {
    super();

    if (!prefix) {
      throw new Error('Specify connectivity store prefix');
    }

    this.program = program;
    this.target = target;

    this.isConnected = undefined;

    this.deviceStore = program.store('device');

    this.prefix = prefix;
  }

  cleanup() {
    const connectivityResumed = this.deviceStore.get(`${this.prefix}Resumed`);
    const connectivityResumedAt = this.deviceStore.get(`${this.prefix}ResumedAt`);

    if (connectivityResumed && Date.now() - connectivityResumedAt > 10 * 1000) {
      this.deviceStore.removeKey(`${this.prefix}Resumed`);
    }
  }

  ping() {
    return new Promise((success, reject) => {
      this.cleanup();

      const target = this.target || this.deviceStore.get('gatewayIp');

      if (target) {
        if (this.program.hasValidIP()) {
          ping(target)
            .then(results => {
              if (this.isConnected == false) {
                if (this.deviceStore.get(`${this.prefix}Problem`)) {
                  const patch = {};
                  patch[`${this.prefix}Resumed`] = true;
                  patch[`${this.prefix}ResumedAt`] = Date.now();
                  this.deviceStore.update(patch, { announce: false });

                  this.deviceStore.removeKey(`${this.prefix}Problem`);

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

    const patch = {};
    patch[`${this.prefix}Problem`] = true;
    this.deviceStore.update(patch);

    if (this.isConnected) {
      this.emit('connection_lost', { code });
    }

    this.isConnected = false;
  }
}
