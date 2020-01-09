const dmt = require('dmt-bridge');
const { log } = dmt;

const msgLanbusChatter = require('./messages/lanbusChatter');

class Nearby {
  constructor(program) {
    this.program = program;

    if (!program.state.nearbyDevices) {
      program.updateState({ nearbyDevices: {} }, { announce: false });
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

  broadcastOurHelloMessage({ onlyUdp = false } = {}) {
    const msgJson = msgLanbusChatter({ program: this.program, deviceId: this.program.device.id, message: 'ΞΞΞ HEY' });
    this.lanbus.broadcastMessage(msgJson, { onlyUdp });
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
        const prevDeviceData = this.program.state.nearbyDevices[obj.deviceId];

        const device = Object.assign(obj, { lastSeenAt: Date.now(), stale: false });

        let announce = false;

        const playStatusChanged = prevDeviceData && (prevDeviceData.playing != device.playing || prevDeviceData.mediaType != device.mediaType);
        const staleStatusChanged = prevDeviceData && prevDeviceData.stale != device.stale;
        if (!prevDeviceData || playStatusChanged || staleStatusChanged) {
          announce = true;
        }

        const hiddenInGui = showOnly && !showOnly.includes(obj.deviceId);

        if (hiddenInGui) {
          device.hiddenInGui = true;
        }

        this.program.replaceStoreElement({ storeName: 'nearbyDevices', key: device.deviceId, value: device }, { announce });
      } catch (e) {
        log.red(e);
      }
    });
  }

  nearbyDevicesListRefresh({ removeStaleImmediately = false } = {}) {
    if (this.program.state.nearbyDevices) {
      const nearbyDevicesNew = {};

      const now = Date.now();

      const { nearbyDevices } = this.program.state;

      for (const deviceId of Object.keys(nearbyDevices)) {
        const device = nearbyDevices[deviceId];

        if (now - device.lastSeenAt > 2.2 * this.broadcastInterval) {
          if (!device.stale && !removeStaleImmediately) {
            nearbyDevicesNew[deviceId] = { ...device, ...{ stale: true, staleDetectedAt: now } };
          } else if (device.staleDetectedAt && now - device.staleDetectedAt < 3000) {
            nearbyDevicesNew[deviceId] = { ...device };
          }
        } else {
          nearbyDevicesNew[deviceId] = { ...device, ...{ stale: false, staleDetectedAt: undefined } };
        }
      }

      this.program.emit('nearby_devices', nearbyDevicesNew);

      this.program.store.replaceState({ nearbyDevices: nearbyDevicesNew }, { announce: false });
    }
  }
}

module.exports = Nearby;
