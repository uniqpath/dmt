function extractIdentifier(topic) {
  const re = new RegExp('tele/([\\w_-]+)/SENSOR');
  const matches = re.exec(topic);
  if (matches) {
    const identifier = matches[1];
    return identifier;
  }
}

const Type = {
  ENERGY: 'energy',
  ENVIRONMENT: 'environment'
};

function determineType(data) {
  if (data.ENERGY) return Type.ENERGY;
  if (data.SI7021 || data.AM2301) return Type.ENVIRONMENT;
}

function parse({ topic, msg }) {
  const id = extractIdentifier(topic);

  if (id) {
    const data = JSON.parse(msg.toString());
    const type = determineType(data);

    const obj = { id, type, lastUpdateAt: Date.now() };

    switch (type) {
      case Type.ENERGY:
        const { Current, Voltage, Power, ApparentPower, ReactivePower, Factor } = data.ENERGY;
        return Object.assign(obj, { data: { Current, Voltage, Power, ApparentPower, ReactivePower, Factor } });

      case Type.ENVIRONMENT:
        const tempData = data.SI7021 || data.AM2301;
        if (tempData.Temperature != null) {
          return Object.assign(obj, { data: Object.assign(tempData, { TempUnit: data.TempUnit }) });
        }

        return Object.assign(obj, { error: true });

      default:
        return null;
    }
  }
}

module.exports = { extractIdentifier, parse, Type };

if (require.main === module) {
  const info = parse({
    topic: 'tele/ID-ddffd-15/SENSOR',
    msg: '{"Time":"2019-04-13T22:20:13","AM2301":{"Temperature":8.5,"Humidity":85.9},"TempUnit":"C"}'
  });
  console.log(info);
}
