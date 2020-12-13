class Foreground {
  constructor({ mcs, thisDeviceStateKeys }) {
    this.mcs = mcs;
    this.thisDeviceStateKeys = thisDeviceStateKeys;
  }

  specialStoreKeys() {
    return this.thisDeviceStateKeys.concat(['activeDeviceKey', 'optimisticDeviceName']);
  }

  clear() {
    this.mcs.clearState({ except: this.specialStoreKeys() });
  }

  set(state, { optimisticDeviceName = undefined } = {}) {
    this.clear();

    const setState = {};

    for (const key of Object.keys(state)) {
      if (!this.specialStoreKeys().includes(key)) {
        setState[key] = state[key];
      }
    }

    if (optimisticDeviceName) {
      setState.optimisticDeviceName = optimisticDeviceName;
    }

    this.mcs.setMerge(setState);
  }

  setSpecial(localDeviceState) {
    const setState = {};

    for (const key of this.thisDeviceStateKeys) {
      setState[key] = localDeviceState[key];
    }

    this.mcs.setMerge(setState);
  }
}

export default Foreground;
