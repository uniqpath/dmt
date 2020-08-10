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

const headers = ['deviceName', 'IP', 'uptime', 'user', 'deviceKey', 'apssid'];

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

function deviceWithMediaMark({ deviceId, playing, mediaType, thisDevice }) {
  const mark = playing ? (mediaType == 'music' ? ' ♪♫♬' : ' ▶') : '';
  const thisMark = thisDevice ? colors.gray(' [this]') : '';
  return colors.cyan(`${deviceId}${thisMark}${colors.magenta(mark)}`);
}

ipcClient({ actorName: 'controller', action, payload })
  .then(_nearbyDevices => {
    if (full) {
      console.log(_nearbyDevices);
      process.exit();
    }

    table.push(headers);

    const nearbyDevices = _nearbyDevices.filter(({ stale }) => !stale).sort(compareValues('deviceId'));

    if (simple) {
      for (const { deviceId, username, ip } of nearbyDevices.filter(({ thisDevice }) => !thisDevice)) {
        console.log(`${deviceId}; ${username}@${ip}`);
      }
    } else {
      table.push(
        ...nearbyDevices.map(({ deviceId, deviceKey, ip, username, uptime, thisDevice, apssid, playing, mediaType }) => [
          deviceWithMediaMark({ deviceId, playing, mediaType, thisDevice }),
          colors.yellow(ip),
          colors.green(uptime),
          colors.gray(username),
          colors.gray(deviceKey),
          apssid ? colors.magenta(identifyDeviceByMac(apssid)) : colors.gray('/')
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
