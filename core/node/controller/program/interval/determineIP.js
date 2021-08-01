import dmt from 'dmt/common';
import { networkInterfaces } from 'dmt/net';
import colors from 'colors';

const { log } = dmt;

function automaticPrivateIP(ip) {
  return ip.startsWith('169.254');
}

export default function determineIP(program) {
  if (program.apMode()) {
    const ip = dmt.accessPointIP;
    if (program.state().device.ip != ip) {
      program.store.update({ device: { ip } });
    }
  } else {
    networkInterfaces()
      .then(interfaces => {
        let ip;

        if (interfaces && interfaces.length >= 1) {
          ip = interfaces[0].ip_address;
        }

        if (program.state().device.ip != ip) {
          program.store.update({ device: { ip } });

          if (!ip) {
            log.yellow('⚠️  Device currently does not have any IP address assigned');
          }

          if (automaticPrivateIP(ip)) {
            log.yellow(`⚠️  Automatic Private IP address assigned: ${colors.gray(ip)}`);
            log.gray('this means that device temporarily cannot see the network or that dhcp server is not present on the network');
          } else if (ip && automaticPrivateIP(program.state().device.ip)) {
            log.green(`✓ Device received a valid IP address (${colors.gray(ip)}) again.`);
          }
        }
      })
      .catch(e => {});
  }
}
