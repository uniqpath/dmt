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

const headers = ['device', 'dmtVersion', 'local ip', 'platform', 'uptime', 'user', 'apssid', 'deviceKey'];

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
    return colors.brightWhite(ip);
  }

  if (thisDevice) {
    return colors.cyan(ip);
  }

  return ip;
}

function compareDmtVersions(_v1, _v2) {
  const re = new RegExp(/^[\d.]+/);

  const v1 = _v1.match(re)[0];
  const v2 = _v2.match(re)[0];

  const [v1a, v1b, v1c] = v1.split('.');
  const [v2a, v2b, v2c] = v2.split('.');

  if (v1a > v2a) {
    return 1;
  }
  if (v1a < v2a) {
    return -1;
  }
  if (v1b > v2b) {
    return 1;
  }
  if (v1b < v2b) {
    return -1;
  }
  if (v1c > v2c) {
    return 1;
  }
  if (v1c < v2c) {
    return -1;
  }
  return 0;
}

function displayDmtVersion(thisDmtVersion, dmtVersion, thisDevice) {
  if (!dmtVersion) {
    return '?';
  }

  const compareVersions = compareDmtVersions(dmtVersion, thisDmtVersion);

  if (compareVersions > 0) {
    return colors.green(`↑ ${dmtVersion}`);
  }

  if (compareVersions < 0) {
    return colors.gray(`↓ ${dmtVersion}`);
  }

  return colors.cyan(`${thisDevice ? '✓' : '≡'} ${dmtVersion}`);
}

ipcClient({ actorName: 'device', action, payload })
  .then(_nearbyDevices => {
    if (full) {
      console.log(_nearbyDevices);
      process.exit();
    }

    table.push(headers.map(h => colors.yellow(h)));

    const nearbyDevices = _nearbyDevices.filter(({ stale }) => !stale).sort(compareValues('deviceName'));

    const thisDeviceData = nearbyDevices.find(({ thisDevice }) => thisDevice);

    if (simple) {
      for (const { deviceName, username, ip } of nearbyDevices.filter(({ thisDevice }) => !thisDevice)) {
        console.log(`${deviceName}; ${username}@${ip}`);
      }
    } else {
      table.push(
        ...nearbyDevices.map(device => {
          const { deviceName, deviceKey, ip, platform, username, uptime, thisDevice, isSpecialNode, isStream, apssid, dmtVersion, playing, mediaType } = device;

          return [
            deviceWithMediaMark({ deviceName, playing, mediaType, isStream }),
            displayDmtVersion(thisDeviceData.dmtVersion, dmtVersion, thisDevice),
            ipInfo({ ip, isSpecialNode, thisDevice }),
            platform ? colors.gray(platform) : '?',
            colors.green(uptime),
            colors.gray(username),
            apssid ? colors.magenta(identifyDeviceByMac(apssid)) : colors.gray('/'),
            colors.gray(`${deviceKey.substr(0, 8)} …`)
          ];
        })
      );

      console.log(table.toString());
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
