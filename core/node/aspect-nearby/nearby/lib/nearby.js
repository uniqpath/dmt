import dmt from 'dmt/bridge';
const { log, util } = dmt;

import constructOurMessage from './attach/constructOurMessage';
import deriveDeviceData from './attach/deriveDeviceData';
import detectStaleDevices from './state/detectStaleDevices';
import updateDeviceInList from './state/updateDeviceInList';

class Nearby {
  constructor(program) {
    this.program = program;

    if (!program.state().nearbyDevices) {
      program.store.update({ nearbyDevices: [] }, { announce: false });
    }

    this.broadcastInterval = 2 * dmt.globals.tickerPeriod * 1000;

    this.init();
  }

  init() {
    this.lanbus = this.program.lanbus;

    this.setupdetectStaleDevices();

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

  refreshNearbyDevicesList(removeStaleImmediately = false) {
    if (this.program.state().nearbyDevices) {
      const { nearbyDevices } = this.program.state();

      const nearbyDevicesNew = detectStaleDevices(
        {
          nearbyDevices,
          broadcastInterval: this.broadcastInterval
        },
        { removeStaleImmediately }
      );

      nearbyDevicesNew.push({ ...this.ourMessage(), thisDevice: true, stale: false, staleDetectedAt: undefined });

      const sortedDevices = nearbyDevicesNew.sort(util.compareValues('deviceName'));

      this.program.store.replaceSlot('nearbyDevices', sortedDevices, { announce: false });

      this.program.emit('nearby_devices', sortedDevices);
    }
  }

  setupdetectStaleDevices() {
    this.refreshNearbyDevicesList(true);

    this.program.on('tick', () => this.refreshNearbyDevicesList());
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
