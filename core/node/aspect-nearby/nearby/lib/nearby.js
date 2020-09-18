import dmt from 'dmt/bridge';
const { log } = dmt;

import attachNearbyDeviceAttributes from './attachNearbyDeviceAttributes';

class Nearby {
  constructor(program) {
    this.program = program;

    if (!program.state().nearbyDevices) {
      program.store.update({ nearbyDevices: [] }, { announce: false });
    }

    this.broadcastInterval = 2 * dmt.globals.tickerPeriod * 1000;
  }

  registerLanbus(lanbus) {
    this.lanbus = lanbus;

    this.setupNearbyDevicesListRefresh();

    this.program.on('player_play_state_changed', () => {
      this.broadcastOurHelloMessage();
    });

    this.program.on('responsible_node_state_changed', () => {
      this.broadcastOurHelloMessage();
    });

    this.initNearbyHelloMessagesListener();

    this.lanbus.on('lanbus-ping-request-for-us', () => {
      this.broadcastOurHelloMessage();
    });

    setTimeout(() => {
      this.broadcastOurHelloMessage({ onlyUdp: true });

      const broadcastLoop = () => {
        setTimeout(() => {
          this.broadcastOurHelloMessage();
          broadcastLoop();
        }, this.broadcastInterval);
      };

      broadcastLoop();
    }, 1000);
  }

  ourMessage() {
    const msg = { processId: process.pid, message: 'ΞΞΞ HEY', origin: 'dmt' };
    return attachNearbyDeviceAttributes({ program: this.program, msg });
  }

  broadcastOurHelloMessage({ onlyUdp = false } = {}) {
    const msg = this.ourMessage();

    if (msg.ip) {
      this.lanbus.broadcastMessage(msg, { onlyUdp });
    } else {
      log.debug('Not broadcasting LANBUS MQTT message because IP address of this device is unknown...');
    }
  }

  setupNearbyDevicesListRefresh() {
    this.nearbyDevicesListRefresh({ removeStaleImmediately: true });

    this.program.on('tick', () => this.nearbyDevicesListRefresh());
  }

  initNearbyHelloMessagesListener() {
    const showOnlyDef = this.program.device.try('service[gui].nearby.showOnly');
    const showOnly = showOnlyDef ? showOnlyDef.split(',').map(el => el.trim()) : null;

    this.lanbus.on('message', obj => {
      try {
        if (obj.deviceKey == dmt.keypair().publicKeyHex) {
          return;
        }

        const prevDeviceData = this.program.state().nearbyDevices.find(({ deviceKey }) => deviceKey == obj.deviceKey);

        const device = Object.assign(obj, { lastSeenAt: Date.now(), stale: false });

        let announce = false;

        const playStatusChanged = prevDeviceData && (prevDeviceData.playing != device.playing || prevDeviceData.mediaType != device.mediaType);
        const staleStatusChanged = prevDeviceData && prevDeviceData.stale != device.stale;
        if (!prevDeviceData || playStatusChanged || staleStatusChanged) {
          announce = true;
        }

        const hiddenInGui = showOnly && !showOnly.includes(obj.deviceName);

        if (hiddenInGui) {
          device.hiddenInGui = true;
        }

        const { nearbyDevices } = this.program.state();

        let found;

        for (let i = 0; i < nearbyDevices.length; i++) {
          if (nearbyDevices[i].deviceKey == obj.deviceKey) {
            nearbyDevices[i] = device;
            found = true;
          }
        }

        if (!found) {
          nearbyDevices.push(device);
        }

        if (announce) {
          this.program.store.announceStateChange();
        }
      } catch (e) {
        log.red(e);
      }
    });
  }

  nearbyDevicesListRefresh({ removeStaleImmediately = false } = {}) {
    if (this.program.state().nearbyDevices) {
      const nearbyDevicesNew = [];

      const now = Date.now();

      const { nearbyDevices } = this.program.state();

      for (const device of nearbyDevices.filter(({ deviceKey }) => deviceKey != dmt.keypair().publicKeyHex)) {
        if (now - device.lastSeenAt > 2.2 * this.broadcastInterval) {
          if (!device.stale && !removeStaleImmediately) {
            nearbyDevicesNew.push({ ...device, ...{ stale: true, staleDetectedAt: now } });
          } else if (device.staleDetectedAt && now - device.staleDetectedAt < 3000) {
            nearbyDevicesNew.push({ ...device });
          }
        } else {
          nearbyDevicesNew.push({ ...device, ...{ stale: false, staleDetectedAt: undefined } });
        }
      }

      nearbyDevicesNew.push({ ...this.ourMessage(), ...{ thisDevice: true, stale: false, staleDetectedAt: undefined } });

      this.program.store.replaceSlot('nearbyDevices', nearbyDevicesNew, { announce: false });

      this.program.emit('nearby_devices', nearbyDevicesNew);
    }
  }
}

export default Nearby;
