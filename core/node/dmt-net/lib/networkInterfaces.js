import network from 'network';

async function getNetworkInterfaces() {
  return new Promise((success, reject) => {
    network.get_interfaces_list((err, list) => {
      if (err) {
        reject(err);
      } else if (list.length == 0) {
        reject(new Error('No network interfaces'));
      } else {
        list = list.filter(_interface => _interface.ip_address && _interface.gateway_ip);
        if (list.length == 0) {
          reject(new Error('Active network interface not found'));
        } else {
          success(
            list
              .filter(_interface => _interface.type == 'Wired')
              .concat(list.filter(_interface => _interface.type == 'Wireless'))
              .concat(list.filter(_interface => _interface.type == 'Other'))
              .concat(list.filter(_interface => !['Wired', 'Wireless', 'Other'].includes(_interface.type)))
          );
        }
      }
    });
  });
}

export default getNetworkInterfaces;
