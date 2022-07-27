import getNetworkInterfaces from './networkInterfaces.js';
import readMAC from './readMac.js';

async function getGatewayMac() {
  const _interfaces = await getNetworkInterfaces();

  return new Promise((success, reject) => {
    readMAC(_interfaces[0].gateway_ip, (err, mac) => {
      err ? reject(err) : success(mac);
    });
  });
}

export default getGatewayMac;
