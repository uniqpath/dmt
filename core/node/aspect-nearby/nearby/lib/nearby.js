import dmt from 'dmt/common';
const { log, util } = dmt;

import constructOurMessage from './attach/constructOurMessage';
import deriveDeviceData from './attach/deriveDeviceData';
import detectStaleDevices from './state/detectStaleDevices';
import updateDeviceInList from './state/updateDeviceInList';

class Nearby {
  constructor(program) {
    this.program = program;

    program.store('nearbyDevices').makeArray();

    this.broadcastInterval = 2 * dmt.globals.tickerPeriod * 1000;

    program.on('tick', () => {
      if (!this.lanbus) {
        this.lanbus = this.program.lanbus;

        if (this.lanbus) {
          this.init();
        }
      }
    });
  }

  init() {
    this.refreshNearbyDevicesList();

    this.program.on('tick', () => this.refreshNearbyDevicesList());

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
    return constructOurMessage({ program: this.program, msg });
  }

  broadcastOurHelloMessage({ onlyUdp = false } = {}) {
    const msg = this.ourMessage();

    if (msg.ip) {
      this.lanbus.broadcastMessage(msg, { onlyUdp });
    } else {
      log.debug('Not broadcasting LANBUS MQTT message because IP address of this device is unknown...');
    }
  }

  refreshNearbyDevicesList() {
    const nearbyDevices = this.program.store('nearbyDevices').get();

    const nearbyDevicesNew = detectStaleDevices({
      nearbyDevices,
      broadcastInterval: this.broadcastInterval
    });

    nearbyDevicesNew.push({ ...this.ourMessage(), thisDevice: true, stale: false, staleDetectedAt: undefined });

    const sortedDevices = nearbyDevicesNew.sort(util.orderBy('deviceName'));

    this.program.store('nearbyDevices').set(sortedDevices, { announce: false });

    this.program.emit('nearby_devices', sortedDevices);
  }

  initNearbyHelloMessagesListener() {
    const showOnlyDef = this.program.device.try('service[gui].nearby.showOnly');
    const showOnly = showOnlyDef ? showOnlyDef.split(',').map(el => el.trim()) : null;

    this.lanbus.on('message', obj => {
      try {
        if (obj.deviceKey == dmt.keypair().publicKeyHex) {
          return;
        }

        if (this.program.device.subnet && this.program.device.subnet != obj.subnet) {
          return;
        }

        const prevDeviceData = this.program
          .store('nearbyDevices')
          .get()
          .find(({ deviceKey }) => deviceKey == obj.deviceKey);

        const device = Object.assign(obj, { lastSeenAt: Date.now(), stale: false });

        let announce = false;

        const playStatusChanged = prevDeviceData && (prevDeviceData.playing != device.playing || prevDeviceData.mediaType != device.mediaType);
        const staleStatusChanged = prevDeviceData && prevDeviceData.stale != device.stale;
        if (!prevDeviceData || playStatusChanged || staleStatusChanged) {
          announce = true;
        }

        const hiddenInGui = showOnly && !showOnly.includes(device.deviceName);

        if (hiddenInGui) {
          device.hiddenInGui = true;
        }

        const { program } = this;
        updateDeviceInList({ device: deriveDeviceData(device), program, announce });
      } catch (e) {
        log.red(e);
      }
    });
  }
}

export default Nearby;
