import network from 'network';

async function privateIp() {
  return new Promise((success, reject) => {
    network.get_private_ip((err, ip) => {
      if (err) {
        reject(err);
      } else {
        success(ip);
      }
    });
  });
}

export { privateIp };
