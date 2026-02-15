import { exec } from 'child_process';
import { stat } from 'fs';

import ErrorHandler from './error.js';

const util = {
  findIPCCommand(options) {
    return new Promise((resolve, reject) => {
      if (options.ipc_command) {
        if (!['--input-ipc-server', '--input-unix-socket'].includes(options.ipc_command)) {
          reject(
            new ErrorHandler().errorMessage(1, 'start()', [options.ipc_command], `"${options.ipc_command}" is not a valid ipc command`, {
              '--input-unix-socket': 'mpv 0.16.0 and below',
              '--input-ipc-server': 'mpv 0.17.0 and above'
            })
          );
        } else {
          resolve(options.ipc_command);
        }
      } else {
        exec(options.binary ? `"${options.binary}" --version` : 'mpv --version', { encoding: 'utf8' }, (err, stdout, stderr) => {
          if (err) {
            return reject(err);
          }

          if (stdout.match(/UNKNOWN/) == null) {
            const regexMatch = stdout.match(/(mpv) \d+.\d+.\d+/);

            if (regexMatch) {
              const match = regexMatch[0];
              const mpvVersion = match.split(' ').slice(1)[0];

              const minor = parseInt(mpvVersion.split('.')[1]);
              if (minor >= 17) {
                resolve({ ipcCommand: '--input-ipc-server', mpvVersion });
              } else {
                resolve({ ipcCommand: '--input-unix-socket', mpvVersion });
              }
            } else {
              resolve({ ipcCommand: '--input-ipc-server', mpvVersion: null });
            }
          } else {
            resolve({ ipcCommand: '--input-ipc-server', mpvVersion: null });
          }
        });
      }
    });
  },
  checkMpvBinary(binary) {
    return new Promise((resolve, reject) => {
      if (binary) {
        stat(binary, (err, stats) => {
          if (err && err.errno == -2) {
            reject(new ErrorHandler().errorMessage(2, 'start()', [binary]));
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  },
  mergeDefaultOptions: userInputOptions => {
    const defaultOptions = {
      debug: false,
      verbose: false,
      socket: process.platform === 'win32' ? '\\\\.\\pipe\\mpvserver' : '/tmp/node-mpv.sock',
      audio_only: false,
      auto_restart: true,
      time_update: 1,
      binary: null
    };

    return Object.assign(defaultOptions, userInputOptions);
  },
  observedProperties: audioOnlyOption => {
    let basicObserved = {
      mute: false,
      pause: false,
      duration: null,
      volume: 100,
      filename: null,
      path: null,
      'media-title': null,
      'playlist-pos': null,
      'playlist-count': null,
      'idle-active': null,
      metadata: null,
      'audio-bitrate': null,
      loop: 'no'
    };

    const observedVideo = {
      fullscreen: false,
      'sub-visibility': false
    };

    if (!audioOnlyOption) {
      basicObserved = Object.assign(basicObserved, observedVideo);
    }

    return basicObserved;
  },
  mpvArguments(options, userInputArguments) {
    let defaultArgs = ['--idle', '--really-quiet', '--msg-level=ipc=v', '--no-ytdl', '--no-audio-display'];
    if (options.pulseaudio) {
      defaultArgs = [...defaultArgs, ...['-ao=pulse']];
    }

    if (options.log) {
      defaultArgs = [...defaultArgs, ...[`--log-file=${options.log}`]];
    }

    if (options.audio_only) {
      defaultArgs = [...defaultArgs, ...['--no-video']];
    } else {
      defaultArgs = [...defaultArgs, ...['--fullscreen']];
    }

    if (userInputArguments) {
      defaultArgs = [...new Set([...defaultArgs, ...userInputArguments])];
    }

    return defaultArgs;
  },
  formatOptions(options) {
    const optionJSON = {};
    let splitted = [];
    for (let i = 0; i < options.length; i++) {
      splitted = options[i].split('=');
      optionJSON[splitted[0]] = splitted[1];
    }
    return optionJSON;
  }
};

export default util;
