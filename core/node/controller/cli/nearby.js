import colors from 'colors';
import { ipcClient, parseArgs, Table } from 'dmt/cli';

import dmt from 'dmt/common';
const { orderBy, normalizeMac } = dmt.util;

import fs from 'fs';
import path from 'path';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

if (args.help == true) {
  console.log(colors.yellow('💡 HELP'));
  console.log();
  console.log(`${colors.green('dmt nearby --full')} see full deviceKey`);
  process.exit();
}

const table = new Table();

const headers = ['device', 'dmtVersion', 'local ip', 'platform', 'uptime', 'user', 'apssid', 'deviceKey'];

const action = 'nearby';

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

function deviceWithMediaMark({ deviceName, thisDevice, playing, mediaType, isStream }) {
  let mark = playing ? (mediaType == 'video' ? ' ▶' : ' ♪♫♬') : '';

  if (playing && isStream) {
    mark = `${mark}${colors.gray(' [stream]')}`;
  }

  return colors.cyan(`${thisDevice ? colors.white('→') : ''} ${deviceName}${colors.white(mark)}`.trim());
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

function displayDmtVersion({ dmtVersion, versionCompareSymbol }) {
  return colors.gray(`${colors.cyan(versionCompareSymbol)} ${dmtVersion}`);
}

ipcClient({ actorName: 'controller', action })
  .then(_nearbyDevices => {
    table.push(headers.map(h => colors.cyan(h)));

    table.push(Table.divider);

    const nearbyDevices = _nearbyDevices.filter(({ stale }) => !stale);

    if (args.simple) {
      for (const { deviceName, username, ip } of nearbyDevices.filter(({ thisDevice }) => !thisDevice)) {
        console.log(`${deviceName}; ${username}@${ip}`);
      }
    } else {
      table.push(
        ...nearbyDevices.map(device => {
          const {
            deviceName,
            deviceKey,
            ip,
            platform,
            username,
            uptime,
            thisDevice,
            isSpecialNode,
            isStream,
            apssid,
            dmtVersion,
            versionCompareSymbol,
            playing,
            mediaType
          } = device;

          return [
            deviceWithMediaMark({ deviceName, playing, mediaType, isStream, thisDevice }),
            displayDmtVersion({ dmtVersion, versionCompareSymbol }),
            ipInfo({ ip, isSpecialNode, thisDevice }),
            platform ? colors.gray(platform) : '?',
            colors.green(uptime),
            colors.gray(username),
            apssid ? colors.gray(identifyDeviceByMac(apssid)) : colors.gray('/'),
            colors.gray(args.full ? deviceKey : `${deviceKey?.substr(0, 8)}…`)
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
