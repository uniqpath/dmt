import * as dmt from 'dmt/common';
const { def, programStateFile: stateFilePath, isDevUser, apMode, apInfo } = dmt;

import { reduceSizeOfStateForGUI as omitStateFn } from 'dmt/gui';

import { SyncStore } from 'dmt/connectome-stores';

const STATE_SCHEMA_VERSION = 0.8;

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
      apMode: apMode(),
      apInfo: apMode() ? apInfo() : undefined,
      // versions
      dmtVersion: dmt.dmtVersion(),
      nodejsVersion: process.version,
      platform: dmt.platformDescription(),
      // boot time
      dmtStartedAt: Date.now()
    }
  };

  const beforeLoadAndSave = state => {
    const { player } = state;
    if (player) {
      delete player.currentMedia;

      delete player.timeposition;
      delete player.percentposition;
      delete player.bitrate;

      delete player.duration;
      delete player.paused;

      delete player.limitReached;
      delete player.timeLimitReached;

      delete player.error;
      delete player.isStream;

      delete player.idleSince;
    }
  };

  const store = new SyncStore(initState, {
    stateFilePath,
    unsavedSlots: [
      'device',
      'time',
      'log',
      'appList',
      'nearbyDevices',
      'nearbySensors',
      'environment',
      // connectivity
      'peerlist',
      'connectionsIn',
      'connectionsOut',
      // dubious
      'entireLinkIndexCloud',
      'entireLinkIndexCount',
      'sysinfo',
      'services',
      'gui',
      // todo: move to the app ... and create app state functions!
      'blinds',
      'deviceRestarters'
    ],
    schemaVersion: STATE_SCHEMA_VERSION,
    beforeLoadAndSave,
    noRecovery: !isDevUser(), // only pile up recovery files on state drops if dev user .. to find all migration bugs.. if they make it to production, so be it, cannot help it anymore and lost state must have not been that important
    omitStateFn
  });

  store.slot('notifications').makeArray();
  store.slot('nearbyDevices').makeArray();
  store.slot('environment').makeArray();
  store.slot('recentSearchQueries').makeArray();
  store.slot('log').makeArray();

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
