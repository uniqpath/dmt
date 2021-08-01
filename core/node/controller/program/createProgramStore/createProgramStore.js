import dmt from 'dmt/common';
const { def } = dmt;

import { saveState, loadState } from './statePersist';

import { reduceSizeOfStateForGUI as omitStateFn } from 'dmt/gui';

import { SlottedStore } from 'dmt/connectome-stores';

// todo: improve conceptually
function removeStateChangeFalseTriggers(stateClone) {
  if (stateClone.nearbyDevices) {
    for (const deviceInfo of stateClone.nearbyDevices) {
      delete deviceInfo.staleDetectedAt;
      delete deviceInfo.lastSeenAt;
    }
  }

  return stateClone;
}

export default function createProgramStore(program) {
  const { device } = program;

  const initState = {
    device: {
      deviceName: device.id,
      deviceKey: dmt.keypair()?.publicKeyHex,
      tagline: device.tagline,
      demoDevice: def.isTruthy(device.demo),
      // server mode:
      // - time comes from browser
      // - disable "dangerous options" -- "Have you tried"
      serverMode: def.isTruthy(device.serverMode),
      subnet: device.subnet,
      devMachine: dmt.isDevMachine(),
      devUser: dmt.isDevUser(),
      // connectivity
      apMode: program.apMode(),
      apInfo: program.apMode() ? program.apInfo() : undefined,
      // versions
      dmtVersion: dmt.dmtVersion(),
      nodejsVersion: process.version,
      platform: dmt.platformDescription(),
      // boot time
      dmtStartedAt: Date.now()
    }
  };

  const store = new SlottedStore(initState, { saveState, loadState, omitStateFn, removeStateChangeFalseTriggers });

  store.slot('notifications').makeArray();
  store.slot('recentSearchQueries').makeArray();

  // these don't survive dmt-proc restart (so called volatile memory)
  store.slot('device').makeVolatile();
  store.slot('time').makeVolatile();
  store.slot('log').makeVolatile();
  // applist
  store.slot('appList').makeVolatile();
  // nearby
  store.slot('nearbySensors').makeVolatile();
  store.slot('nearbyDevices').makeVolatile();

  store.slot('environment').makeVolatile(environment => {
    delete environment.timestamp;
    delete environment.updatedAt;
    delete environment.expireAt;
  });

  // connectivity
  store.slot('peerlist').makeVolatile();
  store.slot('connectionsIn').makeVolatile();
  store.slot('connectionsOut').makeVolatile();
  // dubious
  store.slot('entireLinkIndexCloud').makeVolatile();
  store.slot('entireLinkIndexCount').makeVolatile();
  store.slot('sysinfo').makeVolatile();
  store.slot('services').makeVolatile();
  store.slot('gui').makeVolatile();
  //⚠️
  store.slot('blinds').makeVolatile(); // todo: move to the app ... and create app state functions!
  store.slot('deviceRestarters').makeVolatile(); // this as well

  store.slot('player').makeVolatile(playerState => {
    // we don't need this between dmt proc restarts, only during program run
    delete playerState.currentMedia;

    delete playerState.timeposition;
    delete playerState.percentposition;
    delete playerState.bitrate;

    delete playerState.duration;
    delete playerState.paused;

    delete playerState.limitReached;
    delete playerState.timeLimitReached;

    delete playerState.error;
    delete playerState.isStream;

    delete playerState.idleSince;
  });

  store.slot('nearbyDevices').muteAnnounce(nearbyDevices => {
    for (const deviceInfo of nearbyDevices) {
      delete deviceInfo.staleDetectedAt;
      delete deviceInfo.lastSeenAt;
    }
  });

  const guiServiceDef = dmt.services('gui');
  store.slot('services').update({ gui: guiServiceDef }, { announce: false });

  return store;
}
