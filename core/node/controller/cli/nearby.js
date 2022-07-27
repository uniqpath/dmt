import { colors } from 'dmt/common';

import { ipcClient, parseArgs, Table } from 'dmt/cli';

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

const headers = ['device', 'IP address', 'dmt version', 'node.js', 'platform', 'os uptime', 'dmt uptime', 'user', 'wifiAP'];

const action = 'nearby';

function deviceWithMediaMark({ deviceName, thisDevice, playing, mediaType, isStream }) {
  let mark = playing ? (mediaType == 'video' ? ' ▶' : ' ♪♫♬') : '';

  if (playing && isStream) {
    mark = `${mark}${colors.gray(' [stream]')}`;
  }

  return colors.cyan(`${thisDevice ? colors.white('→') : ''} ${deviceName}${colors.white(mark)}`.trim());
}

function ipInfo({ ip, isSpecialNode, thisDevice }) {
  if (!ip) {
    return colors.gray('/');
  }

  if (isSpecialNode) {
    return colors.bold().white(ip);
  }

  if (thisDevice) {
    return colors.cyan(ip);
  }

  return ip;
}

function displayDmtVersion({ dmtVersion, versionCompareSymbol }) {
  return colors.gray(`${colors.cyan(versionCompareSymbol)} ${dmtVersion}`);
}

ipcClient({ apiName: 'controller', action })
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
            osUptime,
            username,
            uptime,
            thisDevice,
            isSpecialNode,
            isStream,
            apssid,
            wifiAP,
            dmtVersion,
            nodejsVersion,
            versionCompareSymbol,
            playing,
            mediaType
          } = device;

          return [
            deviceWithMediaMark({ deviceName, playing, mediaType, isStream, thisDevice }),
            ipInfo({ ip, isSpecialNode, thisDevice }),
            displayDmtVersion({ dmtVersion, versionCompareSymbol }),
            colors.gray(nodejsVersion),
            platform ? colors.gray(platform) : '?',
            osUptime ? colors.cyan(osUptime) : '',
            colors.green(uptime),
            colors.gray(username),
            colors.gray(wifiAP || apssid || '/')
          ];
        })
      );

      console.log(table.toString());
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit(1);
  });
