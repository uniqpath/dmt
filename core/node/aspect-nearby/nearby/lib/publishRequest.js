export default function publishRequest({ udpBus, iotBus, msg }) {
  if (iotBus) {
    iotBus.publish({ topic: msg.request, msg });
  }

  if (udpBus) {
    udpBus.publish(msg).catch(e => {});
  }
}
