import colors from 'colors';

import dmt from 'dmt/bridge';
const { stopwatch } = dmt;

import { iotBus, specialNodes } from 'dmt/iot';
import { UdpBus } from 'dmt/lanbus';

import publishRequest from './publishRequest';

function requestIpMsg(deviceId) {
  return { request: 'lanbus-ping-request', targetDeviceId: deviceId };
}

function cliResolveIpViaUDP({ deviceId }) {
  const start = stopwatch.start();

  const udpBus = new UdpBus();

  return new Promise((success, reject) => {
    udpBus.on('listening', () => {
      publishRequest({ udpBus, msg: requestIpMsg(deviceId) });

      let firstMessage = true;

      udpBus.on('message', msg => {
        if (msg.deviceId == deviceId && firstMessage) {
          firstMessage = false;
          const duration = stopwatch.stop(start);
          console.log(`Resolved ip address via udp in: ${colors.green(duration)}`);

          success(msg.ip);
        }
      });
    });
  });
}

function cliResolveIpViaMQTT({ deviceId }) {
  const start = stopwatch.start();

  return new Promise((success, reject) => {
    let firstMessage = true;

    iotBus.on('message', ({ topic, msg }) => {
      if (topic == 'lanbus-chatter') {
        const data = JSON.parse(msg);

        if (data.deviceId == deviceId && firstMessage) {
          firstMessage = false;
          const duration = stopwatch.stop(start);
          console.log(`Resolved ip address via mqtt in: ${colors.green(duration)}`);
          success(data.ip);
        }
      }
    });

    const pub = () => {
      publishRequest({ iotBus, msg: requestIpMsg(deviceId) });
    };

    iotBus.on('first_connect', () => {
      pub();
    });

    iotBus.on('ap_connect', () => {
      pub();
    });

    iotBus.init(specialNodes({ onlyAp: true }));
  });
}

function combined({ deviceId }) {
  let resolved = false;

  const resolveTimeout = 2;
  setTimeout(() => {
    if (!resolved) {
      console.log(colors.yellow(`Did not resolve in ${resolveTimeout}s, quitting, sorry ...`));
      console.log();
      console.log(colors.white('Possible reasons:'));
      console.log(colors.cyan(`  ${colors.white('■')} this and target device not on the same network`));
      console.log(colors.cyan(`  ${colors.white('■')} ${colors.magenta('dmt-proc')} currently not running on target device`));
      console.log(colors.cyan(`  ${colors.white('■')} udp packet loss (this issue will be solved soon)`));

      process.exit();
    }
  }, resolveTimeout * 1000);

  return new Promise((success, reject) => {
    cliResolveIpViaUDP({ deviceId }).then(ip => {
      if (!resolved) {
        resolved = true;
        success(ip);
      }
    });

    const delay = dmt.isRPi() ? 50 : 20;

    setTimeout(
      () => {
        cliResolveIpViaMQTT({ deviceId }).then(ip => {
          if (!resolved) {
            resolved = true;
            success(ip);
          }
        });
      },
      dmt.apMode() ? 0 : delay
    );
  });
}

export default combined;
