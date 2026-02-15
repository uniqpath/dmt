import { def, device, devices, getIp, util } from 'dmt/common';

export default function outboundConnectList() {
  const connects = def.values(device().connect);

  return connects
    .map(c => {
      if (c.includes('.')) {
        return { address: c, deviceTag: c };
      }

      const deviceName = c;

      const device = devices().find(({ id }) => id == deviceName);

      if (device.domain) {
        return { deviceName, address: device.domain, deviceTag: deviceName };
      }

      const globalIp = getIp({ deviceName });
      return { deviceName, address: globalIp, deviceTag: deviceName };
    })
    .filter(({ address }) => !address.error)
    .sort(util.orderBy('deviceTag'));
}
