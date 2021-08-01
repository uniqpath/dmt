import dmt from 'dmt/common';
import os from 'os';

import deriveDeviceData from './deriveDeviceData';

export default function constructOurMessage({ program, msg }) {
  const { username } = os.userInfo();
  msg.username = username;

  if (!program) {
    return msg;
  }

  const playerState = program.store('player').get();

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

  Object.assign(msg, program.store('device').get());

  msg.uptime = dmt.prettyTimeAge(program.store('device').get().dmtStartedAt).replace(' ago', '');

  msg.hasGui = program.hasGui();

  const logLines = program.store('log').get();

  if (logLines && logLines.find(line => line.meta.error)) {
    msg.hasErrors = true;
  }

  const isSpecialNode = msg.ip == dmt.accessPointIP;

  if (isSpecialNode) {
    msg.isSpecialNode = true;
    msg.networkId = dmt.deviceNetworkId();
  }

  return deriveDeviceData(msg);
}
