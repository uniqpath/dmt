import dmt from 'dmt/bridge';
import os from 'os';

export default function attachNearbyDeviceAttributes({ program, msg }) {
  const { username } = os.userInfo();
  msg.username = username;

  if (!program) {
    return msg;
  }

  const playerState = program.state().player;

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

  Object.assign(msg, program.state().device);

  msg.uptime = dmt.prettyTimeAge(program.state().device.bootedAt).replace(' ago', '');

  msg.hasGui = program.hasGui();

  const logLines = program.state().log;

  if (logLines && logLines.find(line => line.meta.error)) {
    msg.hasErrors = true;
  }

  const isSpecialNode = msg.ip == dmt.accessPointIP;

  if (isSpecialNode) {
    msg.isSpecialNode = true;
    msg.networkId = dmt.definedNetworkId();
  }

  return msg;
}
