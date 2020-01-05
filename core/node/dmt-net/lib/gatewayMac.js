const getNetworkInterfaces = require('./networkInterfaces');
const readMac = require('./readMac');

async function getGatewayMac() {
  const _interfaces = await getNetworkInterfaces();

  return new Promise((success, reject) => {
    readMac.getMAC(_interfaces[0].gateway_ip, (err, mac) => {
      err ? reject(err) : success(mac);
    });
  });
}

module.exports = getGatewayMac;
