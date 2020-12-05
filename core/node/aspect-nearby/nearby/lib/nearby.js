import dmt from 'dmt/bridge';
const { log } = dmt;

import attachNearbyDeviceAttributes from './attachNearbyDeviceAttributes';
import nearbyDevicesListRefresh from './state/nearbyDevicesListRefresh';
import updateDeviceList from './state/updateDeviceList';

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

  refreshNearbyDevicesList(removeStaleImmediately = false) {
    if (this.program.state().nearbyDevices) {
      const { nearbyDevices } = this.program.state();

      const nearbyDevicesNew = nearbyDevicesListRefresh(
        {
          nearbyDevices,
          ourMessage: this.ourMessage(),
          broadcastInterval: this.broadcastInterval
        },
        { removeStaleImmediately }
      );

      this.program.store.replaceSlot('nearbyDevices', nearbyDevicesNew, { announce: false });

      this.program.emit('nearby_devices', nearbyDevicesNew);
    }
  }

  setupNearbyDevicesListRefresh() {
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

        updateDeviceList({ device, announce, program: this.program });
      } catch (e) {
        log.red(e);
      }
    });
  }
}

export default Nearby;
