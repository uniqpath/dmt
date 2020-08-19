import dmt from 'dmt/bridge';
import os from 'os';

import attachSpecialNodeDeviceAttributes from './attachSpecialNodeDeviceAttributes';

export default function attachNearbyDeviceAttributes({ program = null, msg }) {
  if (program) {
    const playerState = program.state.player;

    if (playerState) {
      const playing = !playerState.paused && (playerState.isStream || (playerState.currentMedia && playerState.currentMedia.songPath));

      msg.playing = !!playing;
      if (playerState.currentMedia) {
        msg.mediaType = playerState.currentMedia.mediaType;
      }

      if (playerState.isStream) {
        msg.isStream = true;
      }
    }
  }

  const { username } = os.userInfo();
  msg.username = username;

  if (program) {
    msg.apssid = program.state.controller.apssid;
  }

  if (program) {
    msg.uptime = dmt.prettyMacroTime(program.state.controller.bootedAt).replace(' ago', '');
  }

  if (program) {
    msg.hasGui = program.hasGui();
  }

  if (program) {
    const keypair = dmt.keypair();
    if (keypair) {
      const { publicKeyHex } = keypair;
      msg.deviceKey = publicKeyHex;
    }
  }

  if (program) {
    const logLines = program.state.log;

    if (logLines && logLines.find(line => line.meta.error)) {
      msg.hasErrors = true;
    }
  }

  if (program) {
    attachSpecialNodeDeviceAttributes({ program, msg });
  }

  return msg;
}
