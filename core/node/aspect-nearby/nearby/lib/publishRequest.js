export default function publishRequest({ udpBus, mqttClient, msg }) {
  if (mqttClient) {
    mqttClient.publish({ topic: msg.request, msg });
  }

  if (udpBus) {
    udpBus.publish(msg).catch(e => {});
  }
}
