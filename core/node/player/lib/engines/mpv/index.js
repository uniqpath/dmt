import EventEmitter from 'events';
import fs from 'fs';

import { log, util, colors, dmtPath, debugCategory, services } from 'dmt/common';

import pathModule from 'path';

import { detectMediaType } from 'dmt/search';

import stripAnsi from 'strip-ansi';

import { spawn } from 'child_process';

import MpvAPI from './lib/mpv/mpv.js';

class MpvEngine extends EventEmitter {
  constructor(program) {
    super();

    this.program = program;

    const opts = { verbose: false, time_update: 2 };
    if (process.platform == 'linux' && !services('player').forceAlsa && fs.existsSync('/etc/pulse/default.pa')) {
      opts.pulseaudio = true;
    }

    if (debugCategory('mpv')) {
      log.debug('⚠️  Enabling mpv logging into ~/.dmt/log/mpv.log requires mpv process restart (dmt stop, killall mpv, dmt start)');
      this.enableMpvLogging(opts);
    }

    this.mpvProcess = new MpvAPI(opts);

    this.playerEngineState = {};

    this.prevStatus = undefined;

    this.mpvProcess.on('statuschange', status => {
      this.processStatusChange({ status, prevStatus: this.prevStatus });
      this.prevStatus = { ...status };
    });

    this.prepareEngine(program).then(() => {
      program.on('player:initialized', playerState => {
        this.initEngine(playerState);
      });
    });
  }

  processStatusChange({ status, prevStatus }) {
    this.audioBitrate = status['audio-bitrate'];

    const ignores = { 'audio-bitrate': undefined };

    if (this.isStream(status.path)) {
      ignores.duration = undefined;
    }

    if (!prevStatus || !util.compare({ ...prevStatus, ...ignores }, { ...status, ...ignores })) {
      this.reflectMPVState(status);
    }
  }

  clearTimeposition() {
    delete this.playerEngineState.timeposition;
    delete this.playerEngineState.percentposition;
    delete this.playerEngineState.bitrate;

    this.program.slot('player').update(this.playerEngineState);
  }

  initEngine(playerState) {
    this.playerInitialized = true;

    this.setEngineVolume(playerState.volume);

    setTimeout(() => this.program.slot('player').update(this.playerEngineState), 500);

    this.mpvProcess.on('stopped', () => {
      this.clearTimeposition();

      log.gray('Current player media just finished');

      if (this.spawning && Date.now() - this.connectedAt < 500) {
        log.cyan('Received introductory IDLE (stop) event on first connect after spawn from mpv on macOS (?), ignoring!');
      } else if (!this.isStream()) {
        this.emit('media_finished');
      }
    });

    this.mpvProcess.on('timeposition', ({ seconds, percent }) => {
      const changed = this.playerEngineState.timeposition != seconds;

      if (changed && seconds >= 0) {
        this.playerEngineState.timeposition = seconds;
        this.playerEngineState.percentposition = percent;

        let bitrate = this.audioBitrate;

        if (bitrate) {
          if (bitrate >= 1000) {
            bitrate = `${Math.round(bitrate / 1000)} kbps`;
          } else {
            bitrate = `${bitrate} bps`;
          }
        }

        this.playerEngineState.bitrate = bitrate;

        this.program.slot('player').update(this.playerEngineState, { announce: true });
      }
    });
  }

  reflectMPVState(options) {
    const { pause, volume, path, filename, duration, metadata } = options;

    const mediaTitle = options['media-title'];

    let { idleSince } = this.playerEngineState;
    if (pause || !path) {
      idleSince = idleSince || Date.now();
    } else {
      idleSince = null;
    }

    const { timeposition, percentposition, bitrate } = this.playerEngineState;

    const newState = {
      volume,
      paused: pause || !path,
      timeposition,
      bitrate,
      percentposition,
      idleSince,
      currentMedia: {
        song: mediaTitle,
        songPath: path,
        mediaType: detectMediaType(path),
        duration
      }
    };

    newState.isStream = this.isStream(path);
    newState.currentMedia.filename = newState.isStream ? undefined : filename;

    if (metadata) {
      newState.currentMedia = Object.assign(newState.currentMedia, {
        artist: metadata.artist || metadata.ARTIST,
        album: metadata.album || metadata.ALBUM,
        year: metadata.date || metadata.DATE
      });
    } else {
      newState.currentMedia = Object.assign(newState.currentMedia, {
        artist: '',
        album: '',
        year: ''
      });
    }

    if (this.playerInitialized && !util.compare(this.playerEngineState, newState)) {
      this.program.slot('player').update(newState);

      clearTimeout(this.stateChangedSmallDelayTimer);

      if (this.playerEngineState.paused != newState.paused || this.playerEngineState.currentMedia.mediaType != newState.currentMedia.mediaType) {
        const emit = () => {
          this.program.emit('player_play_state_changed', { paused: newState.paused, mediaType: newState.currentMedia.mediaType });
        };

        if (newState.paused) {
          this.stateChangedSmallDelayTimer = setTimeout(emit, 100);
        } else {
          emit();
        }
      }
    }

    this.playerEngineState = newState;
  }

  enableMpvLogging(opts, { enable = true } = {}) {
    if (enable) {
      const logDir = pathModule.join(dmtPath, 'log');
      if (fs.existsSync(logDir)) {
        opts.log = pathModule.join(logDir, 'mpv.log');
      }
    }
  }

  load(filePath) {
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          engine.mpvProcess
            .load(filePath)
            .then(success)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  play(filePath) {
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          if (filePath) {
            this.clearTimeposition();

            log.yellow(`mpv engine play ${filePath}`);

            engine.mpvProcess
              .load(filePath)
              .then(() => {
                engine.mpvProcess
                  .play()
                  .then(success)
                  .catch(reject);
              })
              .catch(reject);
          } else {
            engine.mpvProcess
              .play()
              .then(success)
              .catch(reject);
          }
        })
        .catch(reject);
    });
  }

  pause() {
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          engine.mpvProcess
            .pause()
            .then(success)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  stop() {
    log.yellow('mpv engine stop current');
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          engine.mpvProcess
            .stop()
            .then(success)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  seek({ seconds }) {
    log.gray(`mpv engine seek to ${seconds} seconds`);
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          engine.mpvProcess
            .goToPosition(seconds)
            .then(success)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  forward({ seconds }) {
    log.gray(`mpv engine skip forward ${seconds} seconds`);
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          engine.mpvProcess
            .seek(seconds)
            .then(success)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  volume(vol) {
    return new Promise((success, reject) => {
      if (vol == null) {
        success(this.program.slot('player').get('volume'));
      } else {
        this.program.slot('player').update({ volume: vol });
        this.setEngineVolume(vol);
        success(vol);
      }
    });
  }

  setEngineVolume(vol) {
    const self = this;
    return new Promise((success, reject) => {
      this.prepareEngine()
        .then(engine => {
          self.playerEngineState.volume = vol;
          engine.mpvProcess.volume(vol);
          success();
        })
        .catch(reject);
    });
  }

  prepareEngine(program) {
    const self = this;

    return new Promise((success, reject) => {
      if (self.connectedToMpvProcess) {
        success(self);
      } else {
        this.start()
          .then(engine => {
            program.slot('player').removeKey('error');
            success(engine);
          })
          .catch(e => {
            const helpUrl = 'https://github.com/uniqpath/dmt/blob/master/help/MPV_SETUP.md';
            const msg = `${colors.cyan('mpv media player')} binary not present or cannot be found at ${colors.yellow('/usr/local/bin/mpv')} or ${colors.yellow(
              '/usr/bin/mpv'
            )}`;
            program.slot('player').update({ error: { msg: stripAnsi(msg), type: 'mpv_binary_missing', helpUrl } });
            log.write(`${colors.yellow('WARN:')} ${msg}`);
            log.write(`mpv install instructions: ${colors.gray(helpUrl)}`);
          });
      }
    });
  }

  clearState() {
    return new Promise((success, reject) => {
      this.mpvProcess
        .stop()
        .then(() => {
          this.mpvProcess
            .clearPlaylist()
            .then(success)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  start() {
    return new Promise((success, reject) => {
      if (this.connectedToMpvProcess) {
        success(this);
        return;
      }

      log.gray(`Connecting to ${colors.yellow('mpv (multimedia player) process')}`);

      this.mpvProcess
        .connect()
        .then(({ mpvVersion }) => {
          this.program.slot('device').update({ mpvVersion }, { announce: false });

          if (this.connectedToMpvProcess) {
            success(this);
          } else {
            this.mpvProcess.clearPlaylist().then(() => {
              this.connectedToMpvProcess = true;

              log.green(`✓ Connected to ${colors.cyan('mpv process')}`);

              this.connectedAt = Date.now();

              this.readPlayerProcessState();

              success(this);
            });
          }
        })
        .catch((e, info) => {
          if (e.message == 'mpv_not_available') {
            reject(e);
            return;
          }
          if (!this.connectedToMpvProcess) {
            this.spawnMpv().then(this.start().then(success));
          }
        });
    });
  }

  isStream(path) {
    return path && path.startsWith('http');
  }

  readPlayerProcessState() {
    this.mpvProcess
      .getProperty('pause')
      .then(pause => {
        this.mpvProcess
          .getProperty('path')
          .then(path => {
            if (this.program) {
              this.program.emit('player:connected', { paused: pause, currentSongPath: path, isStream: this.isStream(path) });
            }
          })
          .catch(() => {
            if (this.program) {
              this.program.emit('player:connected', { paused: pause });
            }
          });
      })
      .catch(e => {
        log.red('MPV');
        log.red(e);
      });
  }

  spawnMpv() {
    return new Promise((success, reject) => {
      if (this.spawning) {
        setTimeout(success, 2000);
        return;
      }

      this.spawning = true;

      log.magenta(`Spawning long-running ${colors.cyan('mpv process')} ${colors.gray('(it will persist between dmt restarts)')}`);

      const { options, mpv_arguments } = this.mpvProcess;

      const player = spawn(options.binary ? options.binary : 'mpv', mpv_arguments, {
        detached: true,
        stdio: 'ignore'
      });

      player.on('error', err => {
        log.red('Failed to spawn mpv process');
        reject();
      });

      setTimeout(success, 2000);
    });
  }
}

export default MpvEngine;
