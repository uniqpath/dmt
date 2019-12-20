const colors = require('colors');

const dmt = require('dmt-bridge');
const { log, def } = dmt;

const device = dmt.device({ onlyBasicParsing: true });

function write({ networkDef, topic, msg }) {
  if (dmt.accessProperty(device, 'mqtt.enableLogging') == 'true') {
    if (
      !(
        networkDef.mqtt.muteLog &&
        def.listify(networkDef.mqtt.muteLog.topic).find(({ id }) => (id.endsWith('*') ? topic.startsWith(id.slice(0, -1)) : topic == id))
      )
    ) {
      log.write(`${colors.cyan('mqtt:')} ${topic} ■ ${msg}`);
    }
  }

  log.debug(`${colors.yellow('← mqtt msg received:')} ${topic} ■ ${msg}`, { cat: 'mqtt-received' });
}

module.exports = { write };
