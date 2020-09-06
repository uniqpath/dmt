import colors from 'colors';
import { ipcClient } from 'dmt/cli';

import dmt from 'dmt/bridge';
const { compareValues, normalizeMac } = dmt.util;

import fs from 'fs';
import path from 'path';

import Table from 'cli-table2';

const table = new Table({
  chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
});

const headers = ['device', 'local ip', 'this', 'hub', 'uptime', 'user', 'apssid', 'deviceKey'];

const args = process.argv.slice(2);

const simple = args.length == 1 && args[0] == '--simple';
const full = args.length == 1 && args[0] == '--full';

const action = 'nearby';
const payload = args.slice(1).join(' ');

let deviceMaps;

function identifyDeviceByMac(_mac) {
  const devicesFile = path.join(dmt.userDir, 'devices/devices.json');

  if (fs.existsSync(devicesFile) && !deviceMaps) {
    deviceMaps = JSON.parse(fs.readFileSync(devicesFile));
  }

  if (deviceMaps) {
    const match = deviceMaps.find(({ mac }) => normalizeMac(mac) == normalizeMac(_mac));

    if (match) {
      return match.name;
    }
  }

  return _mac;
}

function deviceWithMediaMark({ deviceName, playing, mediaType, isStream }) {
  let mark = playing ? (mediaType == 'video' ? ' ▶' : ' ♪♫♬') : '';

  if (playing && isStream) {
    mark = `${mark}${colors.gray(' [stream]')}`;
  }

  return colors.cyan(`${deviceName}${colors.white(mark)}`);
}

function ipInfo({ ip, isSpecialNode, thisDevice }) {
  if (isSpecialNode) {
    return colors.magenta(ip);
  }

  if (thisDevice) {
    return colors.cyan(ip);
  }

  return ip;
}

ipcClient({ actorName: 'controller', action, payload })
  .then(_nearbyDevices => {
    if (full) {
      console.log(_nearbyDevices);
      process.exit();
    }

    table.push(headers);

    const nearbyDevices = _nearbyDevices.filter(({ stale }) => !stale).sort(compareValues('deviceName'));

    if (simple) {
      for (const { deviceName, username, ip } of nearbyDevices.filter(({ thisDevice }) => !thisDevice)) {
        console.log(`${deviceName}; ${username}@${ip}`);
      }
    } else {
      table.push(
        ...nearbyDevices.map(({ deviceName, deviceKey, ip, username, uptime, thisDevice, isSpecialNode, isStream, apssid, playing, mediaType }) => [
          deviceWithMediaMark({ deviceName, playing, mediaType, isStream }),
          ipInfo({ ip, isSpecialNode, thisDevice }),
          thisDevice ? colors.cyan('✓') : '',
          isSpecialNode ? colors.magenta('✓') : '',
          colors.green(uptime),
          colors.gray(username),
          apssid ? colors.magenta(identifyDeviceByMac(apssid)) : colors.gray('/'),
          colors.gray(deviceKey)
        ])
      );

      console.log(table.toString());
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e.message));
    process.exit();
  });
