const colors = require('colors');

const dmt = require('dmt-bridge');
const { util, cli } = dmt;

const rpc = require('dmt-rpc');
const { aggregateSearchResultsFormatter } = require('dmt-search');
const { cliResolveIp } = require('dmt-nearby');

const PlayerRemote = require('../lib/playerRemote');

function help() {
  console.log(colors.cyan('\n'));
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
}

function resultMap(result) {
  return result;
}

function printSuccessOrErrorStatus(response) {
  if (response.error) {
    console.log(colors.red(`⮑  ${response.error.message}`));
  } else {
    console.log(colors.green('⮑  Success'));
  }
}

function formatSong(song) {
  const line = `${song.current ? colors.cyan('→') : ' '} ${colors.green(dmt.util.pad(song.id, 2))} ${song.path}`;
  if (song.past) {
    return colors.gray(line);
  }

  if (song.current) {
    return colors.cyan(line);
  }

  return line;
}

function printPlaylist({ playlist }) {
  playlist.forEach(song => {
    console.log(formatSong(song));
  });
}

function printPlayerStatus({ status }) {
  if (status.idleSince) {
    status.idleSince = util.relativeTimeSince(status.idleSince);
  }

  util.dir(status);
}

function printSpacedResponse({ spaced }) {
  console.log(
    `Spaced mode is now: ${
      spaced
        ? `${colors.magenta('spaced')} ${colors.gray('(1 min pauses between tracks)')}`
        : `${colors.cyan('unspaced')} ${colors.gray('(regular track flow)')}`
    }`
  );
}

const searchRelatedCommands = ['search', 'play', 'add', 'load', 'insert', 'insplay'];

function printResponse(command, response, rpcArgs) {
  if (dmt.debugMode()) {
    util.dir(response);
  }

  if (response.error) {
    rpc.errorFormatter({ error: response.error.message }, { host: '' });
    return;
  }

  const receivedData = response.result;

  if (searchRelatedCommands.includes(command)) {
    aggregateSearchResultsFormatter(receivedData, resultMap);
    printSuccessOrErrorStatus(response);
  } else {
    switch (command) {
      case 'info':
        util.dir(response.result.methods);
        printSuccessOrErrorStatus(response);
        break;

      case 'list':
        printPlaylist(response.result);
        printSuccessOrErrorStatus(response);
        break;

      case 'status':
        printPlayerStatus(response.result);
        printSuccessOrErrorStatus(response);
        break;

      case 'spaced':
        printSpacedResponse(response.result);
        printSuccessOrErrorStatus(response);
        break;

      case 'unspaced':
        printSpacedResponse(response.result);
        printSuccessOrErrorStatus(response);
        break;

      case 'next':
        if (response.result && response.result.song) {
          console.log(formatSong(response.result.song));
        } else if (rpcArgs.songId) {
          console.log(colors.magenta('Wrong song id'));
        } else if (response.error) {
          console.log(colors.red(response.error));
        }

        printSuccessOrErrorStatus(response);
        break;

      case 'volume':
        printSuccessOrErrorStatus(response);
        if (response.result.volume != null) {
          if (rpcArgs[0]) {
            if (response.result.prevVolume == response.result.volume) {
              console.log(colors.gray(`Volume: ${response.result.volume}`));
            } else {
              const higher = parseInt(response.result.volume) > parseInt(response.result.prevVolume);
              if (higher) {
                console.log(colors.gray(`Volume: ${response.result.prevVolume} → ${colors.magenta(response.result.volume)}`));
              } else {
                console.log(colors.gray(`Volume: ${response.result.prevVolume} → ${colors.cyan(response.result.volume)}`));
              }
            }
          } else {
            console.log(colors.gray(`Volume: ${response.result.volume}`));
          }
        }
        break;

      default:
        printSuccessOrErrorStatus(response);
    }
  }
}

async function request({ device, address, clientMaxResults, mediaType, command, terms }) {
  console.log(
    `${colors.cyan('dmt-player')} ${dmt.services('player').symbol} ${colors.magenta(device.host)} ${colors.gray(`(${address})`)} ${colors.green(
      `Ξ ${command.toUpperCase()}`
    )}`
  );
  const playerRemote = new PlayerRemote({ host: address, mediaType });
  try {
    let rpcArgs;
    if (searchRelatedCommands.includes(command)) {
      rpcArgs = { terms, clientMaxResults };
    } else if (command == 'next') {
      rpcArgs = { songId: terms[0] };
    } else if (['cut', 'bump'].includes(command)) {
      rpcArgs = terms;
    } else {
      rpcArgs = [terms[0]];
    }
    const response = await playerRemote.action(command, rpcArgs);
    printResponse(command, response, rpcArgs);

    process.exit();
  } catch (e) {
    rpc.errorFormatter(e, { host: address });
    console.log();
    console.log(`If ${colors.cyan('DMT Player')} is not running on ${colors.cyan(address)}, please start it with ${colors.green('dmt start')}`);
    process.exit();
  }
}

if (require.main === module) {
  if (process.argv.length > 2 && process.argv[2] == '-h') {
    help();
    process.exit();
  }
  try {
    const allArgs = process.argv.slice(2);
    const { terms, atDevices, attributeOptions } = cli(allArgs);
    const clientMaxResults = attributeOptions.count;
    const mediaType = attributeOptions.media;
    const command = terms.shift() || 'info';
    if (atDevices.length > 1) {
      console.log(colors.red('TODO'));
      process.exit();
    }
    (async () => {
      const device = atDevices[0];

      if (device.localhost) {
        request({ device, address: 'localhost', clientMaxResults, mediaType, command, terms });
      } else {
        cliResolveIp({ deviceId: device.host }).then(ip => {
          request({ device, address: ip, clientMaxResults, mediaType, command, terms });
        });
      }
    })();
  } catch (e) {
    console.log(colors.red(e.message));
  }
}
