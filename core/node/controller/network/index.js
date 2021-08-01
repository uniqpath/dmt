import DetermineNetwork from './determineNetwork';

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
    return this.program.store('device');
  }
}
