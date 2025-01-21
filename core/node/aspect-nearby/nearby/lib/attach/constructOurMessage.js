import { timeutils, accessPointIP, deviceNetworkId } from 'dmt/common';
import os from 'os';

const { prettyTime } = timeutils;

import deriveDeviceData from './deriveDeviceData.js';

export default function constructOurMessage({ program, msg }) {
  const { username } = os.userInfo();
  msg.username = username;

  if (!program) {
    return msg;
  }

  const playerState = program.slot('player').get();

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

  Object.assign(msg, program.slot('device').get());

  const dmtStartedAt = program.slot('device').get('dmtStartedAt');
  if (Date.now() - dmtStartedAt < 60000) {
    msg.uptime = `${Math.round((Date.now() - dmtStartedAt) / 1000)} seconds`;
  } else {
    msg.uptime = prettyTime(dmtStartedAt);
  }

  msg.connectivityFailures12h = program.slot('connectivityReport').get('count12h');

  msg.hasGui = program.hasGui();

  if (program.isHub()) {
    msg.isHub = true;
  }

  const logLines = program.slot('log').get();

  if (logLines && logLines.find(line => line.meta.error)) {
    msg.hasErrors = true;
  }

  const isSpecialNode = msg.ip == accessPointIP;

  if (isSpecialNode) {
    msg.isSpecialNode = true;
    msg.networkId = deviceNetworkId();
  }

  return deriveDeviceData(msg);
}
