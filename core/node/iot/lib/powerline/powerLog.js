import { dmtPath } from 'dmt/common';

import fs from 'fs';
import path from 'path';

let stream;

function powerLog(deviceName, { topic, msg }) {
  const re = new RegExp('tele/(\\w+)/SENSOR');
  const matches = re.exec(topic);
  if (matches) {
    const iotDevice = matches[1];

    if (deviceName == iotDevice) {
      const filePath = path.join(dmtPath, `user/data/${iotDevice}PowerLog.csv`);
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });

      if (!stream) {
        stream = fs.createWriteStream(filePath, { flags: 'a' });
      }

      const payload = JSON.parse(msg.toString());

      if (payload.ENERGY) {
        stream.write(
          `${iotDevice},${payload.Time},${payload.ENERGY.Current},${payload.ENERGY.Voltage},${payload.ENERGY.Power},${payload.ENERGY.ApparentPower},${payload.ENERGY.ReactivePower},${payload.ENERGY.Factor},${payload.ENERGY.Period}\n`
        );
      }
    }
  }
}

export default powerLog;
