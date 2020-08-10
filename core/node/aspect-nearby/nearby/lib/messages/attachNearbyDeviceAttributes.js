import dmt from 'dmt/bridge';
import os from 'os';

export default function attachNearbyDeviceAttributes({ program = null, msg }) {
  if (program) {
    const playerState = program.state.player;

    if (playerState) {
      const playing = !playerState.paused && (playerState.isStream || (playerState.currentMedia && playerState.currentMedia.songPath));

      msg.playing = !!playing;
      if (playerState.currentMedia) {
        msg.mediaType = playerState.currentMedia.mediaType;
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

  if (program && msg.ip == dmt.accessPointIP && dmt.definedNetworkId()) {
    msg.networkId = dmt.definedNetworkId();
  }

  if (program && program.specialNodes) {
    const thisSpecialNode = program.specialNodes.find(node => node.deviceId == program.device.id);
    if (thisSpecialNode) {
      msg.specialNode = true;
      msg.specialNodePriority = thisSpecialNode.priority;
    }

    msg.responsibleNode = program.isResponsibleNode();
  }

  return msg;
}
