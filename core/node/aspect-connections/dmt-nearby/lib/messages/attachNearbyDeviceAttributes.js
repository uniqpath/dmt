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

  if (program) {
    msg.hasGui = program.hasGui();
  }

  if (program) {
    const logLines = program.state.log;

    if (logLines && logLines.find(line => line.meta.error)) {
      msg.hasErrors = true;
    }
  }

  if (program && program.specialNodes) {
    const thisSpecialNode = program.specialNodes.find(node => node.deviceId == program.device.id);
    if (thisSpecialNode) {
      msg.specialNode = true;
      msg.specialNodePriority = thisSpecialNode.priority;
      msg.networkId = thisSpecialNode.networkId;
    }

    msg.responsibleNode = program.isResponsibleNode();
  }

  return msg;
}
