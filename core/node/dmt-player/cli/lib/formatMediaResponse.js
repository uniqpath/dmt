import colors from 'colors';

import { aggregateSearchResultsFormatter, colorJSON, pad } from 'dmt-cli';

function help() {
  console.log(colors.cyan('\n'));
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
}

function printSuccessOrErrorStatus(response) {
  if (response.error) {
    console.log(colors.red(`⮑  ${response.error}`));
  } else {
    console.log(colors.green('⮑  Success'));
  }
}

function formatSong(song) {
  const line = `${song.current ? colors.cyan('→') : ' '} ${colors.green(pad(song.id, 2))} ${song.path}`;
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

const searchRelatedCommands = ['search', 'play', 'add', 'load', 'insert', 'insplay'];
const printResponseOutputCommands = ['repeat', 'limit', 'status', 'bump'];

function printResponse(command, response, args) {
  if (response.error) {
    console.log(colors.red(`⚠️  Error: ${response.error}`));
    return;
  }

  if (searchRelatedCommands.includes(command)) {
    if (command == 'play' && args == '') {
      console.log(colors.green(`Song   : ${response.status.currentMedia.song}`));
      console.log(colors.cyan(`Volume : ${response.status.volume}`));

      printSuccessOrErrorStatus(response);
    } else {
      aggregateSearchResultsFormatter(response);
    }
  } else if (printResponseOutputCommands.includes(command)) {
    console.log(colorJSON(response));
    printSuccessOrErrorStatus(response);
  } else {
    switch (command) {
      case 'info':
        colorJSON(response.methods);
        printSuccessOrErrorStatus(response);
        break;

      case 'list':
        printPlaylist(response);
        printSuccessOrErrorStatus(response);
        break;

      case 'next':
        if (response && response.song) {
          console.log(formatSong(response.song));
        } else if (args[0]) {
          console.log(colors.magenta('Wrong song id'));
        } else if (response.error) {
          console.log(colors.red(response.error));
        }

        printSuccessOrErrorStatus(response);
        break;

      case 'volume':
        printSuccessOrErrorStatus(response);
        if (response.volume != null) {
          if (args[0]) {
            if (response.prevVolume == response.volume) {
              console.log(colors.cyan(`Volume: ${response.volume}`));
            } else {
              const higher = parseInt(response.volume) > parseInt(response.prevVolume);
              if (higher) {
                console.log(colors.cyan(`Volume: ${response.prevVolume} → ${colors.green(response.volume)}`));
              } else {
                console.log(colors.cyan(`Volume: ${response.prevVolume} → ${colors.gray(response.volume)}`));
              }
            }
          } else {
            console.log(colors.cyan(`Volume: ${response.volume}`));
          }
        }
        break;

      default:
        printSuccessOrErrorStatus(response);
    }
  }
}

export default printResponse;
