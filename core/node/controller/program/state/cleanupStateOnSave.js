export default function cleanupStateOnSave(state) {
  if (state.controller) {
    delete state.controller.time;
    delete state.controller.date;
    delete state.controller.dow;
    delete state.controller.holiday;
    delete state.controller.ip;
    delete state.controller.ticker;
    delete state.controller.devMachine;
    delete state.controller.devCluster;
    delete state.controller.wsConnections;
    delete state.controller.bootedAt;
    delete state.controller.sunrise;
    delete state.controller.sunset;
    delete state.controller.apMode;
    delete state.controller.apInfo;
    delete state.controller.serverMode;
    delete state.controller.actualGuiPort;
  }

  delete state.services;
  delete state.appList;

  delete state.log;
  delete state.sysinfo;

  delete state.nearbySensors;
  delete state.nearbyDevices;

  delete state.blinds;
  delete state.deviceRestarters;

  if (state.player) {
    delete state.player.currentMedia;

    delete state.player.timeposition;
    delete state.player.percentposition;
    delete state.player.bitrate;

    delete state.player.duration;
    delete state.player.paused;

    delete state.player.error;
    delete state.player.isStream;

    delete state.player.idleSince;
  }

  return state;
}
