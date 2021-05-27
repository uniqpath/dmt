export default function cleanupStateOnSaveAndLoad(state) {
  delete state.undefined;

  delete state.device;

  delete state.controller;

  delete state.time;

  delete state.gui;

  delete state.entireLinkIndexCloud;
  delete state.entireLinkIndexCount;

  delete state.services;
  delete state.appList;

  delete state.log;
  delete state.sysinfo;

  delete state.nearbySensors;
  delete state.nearbyDevices;

  delete state.blinds;
  delete state.deviceRestarters;

  delete state.peerlist;
  delete state.connectionsOut;
  delete state.connectionsIn;

  if (state.player) {
    delete state.player.currentMedia;

    delete state.player.timeposition;
    delete state.player.percentposition;
    delete state.player.bitrate;

    delete state.player.duration;
    delete state.player.paused;

    delete state.player.limitReached;
    delete state.player.timeLimitReached;

    delete state.player.error;
    delete state.player.isStream;

    delete state.player.idleSince;
  }

  return state;
}
