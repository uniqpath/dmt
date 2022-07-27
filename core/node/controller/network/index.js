import DetermineNetwork from './determineNetwork.js';

export default class Network {
  constructor(program) {
    this.program = program;

    const removeData = () => {
      this.deviceStore().removeKeys(['network', 'latlng', 'country', 'lang']);
      this.lastNetworkupdateAt = null;
    };

    const determineNetwork = new DetermineNetwork(program);

    determineNetwork.on('data', networkData => {
      this.lastNetworkupdateAt = Date.now();
      this.deviceStore().update(networkData, { announce: false });
    });

    determineNetwork.on('remove_data', removeData);

    program.on('slowtick', () => {
      if (this.lastNetworkupdateAt && Date.now() - this.lastNetworkupdateAt > 10 * 1000) {
        removeData();
      }
    });
  }

  connectedWifiAP() {
    const { apssid, wifiAP } = this.program.slot('device').get();
    if (apssid) {
      return `📶 Wifi AP ${wifiAP || ''} ${wifiAP ? '' : apssid}`.replace(/\s+/g, ' ');
    }
  }

  name() {
    return this.deviceStore().get('network');
  }

  latlng() {
    return this.deviceStore().get('latlng');
  }

  country() {
    return this.deviceStore().get('country');
  }

  lang() {
    return this.deviceStore().get('lang') || 'eng';
  }

  deviceStore() {
    return this.program.slot('device');
  }
}
