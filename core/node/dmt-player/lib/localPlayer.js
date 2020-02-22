import dmt from 'dmt-bridge';
const { log } = dmt;

import colors from 'colors';
import fs from 'fs';

import Playlist from './playlist';
import Mpv from './engines/mpv';

import setupUserActionHandlers from './userActionHandlers';

class LocalPlayer {
  constructor({ program }) {
    this.program = program;

    this.engine = new Mpv(program);

    this.playlist = new Playlist({ program });

    this.program.on('player:connected', ({ currentSongPath, paused, isStream }) => {
      this.initPlayer({ currentSongPath, paused, isStream });
    });

    this.engine.on('song_finished', () => {
      this.onSongFinished();
    });

    program.on('tick', () => {
      if (program.state.player && !program.state.player.paused && program.state.player.timeLimit) {
        let remainingTime = program.state.player.timeLimit - dmt.globals.tickerPeriod / 60;
        if (remainingTime < 0) {
          remainingTime = 0;
        }
        if (remainingTime == 0) {
          this.pause();
          this.program.removeStoreElement({ storeName: 'player', key: 'timeLimit' }, { announce: false });
        } else {
          this.program.updateState({ player: { timeLimit: remainingTime } }, { announce: false });
        }
      }
    });
  }

  onSongFinished() {
    if (this.isStream()) {
      log.magenta('stream finished (either network conditions or user stopped it by manual action)');
      return;
    }

    const { limit } = this.program.state.player;
    const limitStr = limit ? ` (limit: ${limit})` : '';
    log.yellow(`Player: finished song ${this.playlist.currentIndex + 1} of ${this.playlist.count()}${limitStr}`);

    if (this.inProcessOfStopping) {
      this.inProcessOfStopping = false;
      return;
    }

    const limitReached = this.decrementLimit();

    if (limitReached) {
      log.magenta('Stopping because limit was reached');

      this.playlist.selectNextSong();
      this.playlist.rollover();
      this.playlist.broadcastPlaylistState();
      return;
    }

    const playNext = () =>
      this.next({ fromAction: false })
        .then(() => {
          if (!this.program.state.player.repeatCount) {
            this.playlist.rollover();
          }
        })
        .catch(() => {
          this.timeLimit('reset');
        });

    playNext();
  }

  initPlayer({ currentSongPath, paused, isStream }) {
    const { updatedFromMpvPlayerState } = this.playlist.init(currentSongPath, isStream);
    this.initVolume();

    setupUserActionHandlers({ program: this.program, player: this });

    if (!updatedFromMpvPlayerState) {
      paused = true;
    }

    this.program.updateState({ player: { paused, currentMedia: { songPath: currentSongPath } } });

    this.program.emit('player:initialized', this.program.state.player);
  }

  initVolume() {
    const currentVolume = this.program.state.player && this.program.state.player.volume != null ? this.program.state.player.volume : undefined;
    const defaultDeviceVolume = dmt.services('player').try('defaultVolume.mpv');
    const defaultVolume = parseInt(defaultDeviceVolume) || 75;

    if (currentVolume != null) {
      log.write(`Setting mpv volume to ${colors.magenta(currentVolume)} from saved program state`);
    } else if (defaultDeviceVolume != null) {
      log.write(`Setting mpv volume to ${colors.cyan(defaultDeviceVolume)} from device.def entry: ${colors.cyan('player.defaultVolume.mpv')}`);
    } else {
      log.write(
        `Setting mpv volume to ${colors.yellow(defaultVolume)} (hard-coded global default) since volume was not saved in program state or defined in device.def`
      );
    }

    const volume = currentVolume == null ? defaultVolume : currentVolume;

    if (volume != null) {
      this.program.updateState({ player: { volume } });
    } else {
      this.program.removeStoreElement({ storeName: 'player', key: 'volume' });
    }
  }

  async play({ files = [] } = {}) {
    return new Promise((success, reject) => {
      if (files.length == 0) {
        if (this.hasLoadedMedia()) {
          this.engine.play().then(() => {
            success();
          });
        } else {
          if (this.playlist.isEmpty()) {
            log.yellow('Called play on an empty playlist, nothing to do ...');
            return;
          }

          this.playCurrent()
            .then(() => {
              success();
            })
            .catch(() => {
              log.red('Playback error');
            });
        }

        return;
      }

      this.program.removeStoreElement({ storeName: 'player', key: 'limit' }, { announce: false });

      this.playlist.clear();
      this.playlist.prepareNumbering();

      this.add({ files });
      this.playCurrent()
        .then(() => {
          success();
        })
        .catch(() => {
          log.red('Playback error: stopped');
        });
    });
  }

  playRadio(radioId) {
    let url = '';
    switch (radioId) {
      case 'jazz':
        url = 'http://us4.internet-radio.com:8266/stream';
        break;
      case 'rock':
        url = 'http://198.58.98.83:8258/stream';
        break;
      case 'classical':
        url = 'http://174.36.206.197:8000/listen.pls?sid=1';
        break;
      case 'christmas':
        url = 'http://46.105.118.14:24000';
        break;
      case 'ambient':
        url = 'http://uk2.internet-radio.com:31491';
        break;
      case 'progressive-trance':
        url = 'http://81.88.36.42:8010/listen.pls?sid=1';
        break;
      case 'goa-trance':
        url = 'http://81.88.36.42:8030/listen.pls?sid=1';
        break;
      default:
        break;
    }

    if (url) {
      this.engine
        .play(url)
        .then(() => {
          log.green(`Play radio: ${colors.yellow(radioId)}`);
        })
        .catch(e => {
          log.red(`Problem playing radio ${colors.yellow(radioId)}: ${e.message}`);
        });
    }
  }

  async add({ files }) {
    const filePathToLoad = this.playlist.add(files);
    if (filePathToLoad && !this.isStream()) {
      this.load(filePathToLoad);
    }
  }

  async insert({ files }) {
    this.playlist.insert(files);
  }

  async cut(args) {
    this.playlist.cut(args);
  }

  cutSelected() {
    this.playlist.cutSelected();
  }

  async paste() {
    this.playlist.paste();
  }

  insertSelected() {
    this.cutSelected();
    this.paste();
  }

  async bump(args) {
    const rangePatternOrStr = args.join(' ');

    if (rangePatternOrStr.match(/[a-zA-Z]/)) {
      this.playlist.bumpSearch(rangePatternOrStr);
    } else if (rangePatternOrStr.trim() == '') {
      this.playlist.bumpSelected();
    } else {
      this.playlist.bump(rangePatternOrStr);
    }
  }

  async shuffle() {
    this.playlist.shuffle();
  }

  repeatIncrease() {
    const maxRepeat = 3;

    let { repeatCount } = this.program.state.player;

    if (repeatCount == null) {
      repeatCount = 1;
    } else {
      repeatCount += 1;
    }

    if (repeatCount > maxRepeat) {
      repeatCount = undefined;
    }

    this.program.updateState({ player: { repeatCount } });
  }

  decrementLimit() {
    if (this.program.state.player.repeatCount) {
      return false;
    }

    const { limit } = this.program.state.player;
    if (limit > 1) {
      this.program.updateState({ player: { limit: limit - 1 } }, { announce: false });
    } else if (limit == 1) {
      this.program.removeStoreElement({ storeName: 'player', key: 'limit' }, { announce: false });
      return true;
    }

    return false;
  }

  next({ songId = undefined, fromAction = true } = {}) {
    if (this.playlist.songList().length > 1) {
      this.engine.clearTimeposition();
    }

    return new Promise((success, reject) => {
      this.playNext({ songId, fromAction })
        .then(success)
        .catch(reject);
    });
  }

  playNext({ songId, fromAction } = {}) {
    return new Promise((success, reject) => {
      if (songId) {
        this.playlist
          .selectSong(songId)
          .then(() => {
            this.playCurrent()
              .then(success)
              .catch(reject);
          })
          .catch(reject);
      } else {
        const cont = () => {
          this.playCurrent()
            .then(song => {
              this.playlist.broadcastPlaylistState();
              success(song);
            })
            .catch(reject);
        };

        if (!fromAction && this.program.state.player.repeatCount) {
          let { repeatCount } = this.program.state.player;
          if (repeatCount == 1) {
            repeatCount = null;
          } else {
            repeatCount -= 1;
          }
          this.program.updateState({ player: { repeatCount } });
          cont();
        } else if (this.playlist.selectNextSong() != null) {
          this.program.updateState({ player: { repeatCount: undefined } });
          if (fromAction) {
            this.decrementLimit();
          }
          cont();
        } else {
          reject();
        }
      }
    });
  }

  playCurrent() {
    return new Promise((success, reject) => {
      const song = this.playlist.currentSong();
      log.green('Playing song 🎵');

      const exists = fs.existsSync(song.path);

      if (!exists) {
        this.playlist.detectMissingMedia();

        log.red(`${colors.gray(song.path)} doesn't exist`);
        reject(new Error("Song doesn't exist on disk"));
        return;
      }

      if (song.error && exists) {
        this.playlist.detectMissingMedia();
      }

      log.dir(song);

      this.engine
        .play(song.path)
        .then(() => {
          success({ song });
        })
        .catch(reject);
    });
  }

  load(filePath) {
    this.engine
      .load(filePath)
      .then(() => this.engine.pause())
      .catch(() => log.error(`Problem loading ${filePath}`));
  }

  pause() {
    return new Promise((success, reject) => {
      this.engine
        .pause()
        .then(() => {
          success();
        })
        .catch(reject);
    });
  }

  toggleSelected(songId) {
    this.playlist.toggleSelected(songId);
  }

  limit(num) {
    return new Promise((success, reject) => {
      let limit;

      if (num != 'reset' && num != '0' && num != 0) {
        num = parseInt(num);

        limit = this.program.state.player.limit;

        if (num) {
          limit = num;
        } else if (!limit) {
          limit = 1;
        } else if (this.playlist.currentIndex + limit < this.playlist.count()) {
          limit += 1;
        }
      }

      limit = Math.min(limit, this.playlist.count() - this.playlist.currentIndex);

      this.program.updateState({ player: { limit } }, { announce: false });
      this.program.removeStoreElement({ storeName: 'player', key: 'timeLimit' }, { announce: false });

      this.playlist.broadcastPlaylistState();

      success();
    });
  }

  timeLimit(num) {
    return new Promise((success, reject) => {
      let timeLimit;

      if (num != 'reset' && num != '0' && num != 0) {
        num = parseInt(num);

        timeLimit = this.program.state.player.timeLimit;

        if (num) {
          timeLimit = num;
        } else if (!timeLimit) {
          timeLimit = 10;
        } else if (timeLimit < 25) {
          timeLimit += 10;
          if (timeLimit > 30) {
            timeLimit = 30;
          }
        } else {
          timeLimit += 30;
        }
      }

      if (!this.isStream()) {
        this.program.removeStoreElement({ storeName: 'player', key: 'limit' }, { announce: false });
      }

      this.program.updateState({ player: { timeLimit } });
      this.playlist.broadcastPlaylistState();

      success();
    });
  }

  clone(num) {
    return new Promise((success, reject) => {
      log.green(`CLONED ${num}`);

      success();
    });
  }

  forward(seconds) {
    seconds = seconds || 60;

    return new Promise((success, reject) => {
      this.engine
        .forward({ seconds })
        .then(success)
        .catch(reject);
    });
  }

  backward(seconds) {
    return this.forward(-seconds);
  }

  goto(seconds) {
    seconds = seconds || 0;

    return new Promise((success, reject) => {
      this.engine
        .seek({ seconds })
        .then(success)
        .catch(reject);
    });
  }

  gotoPercentPos(percentPos) {
    if (!this.program.state.player.paused) {
      const duration = this.mediaDuration();
      if (duration) {
        const timepos = percentPos * duration;
        this.goto(timepos);
      }
    }
  }

  hasLoadedMedia() {
    return dmt.accessProperty(this.program.state, 'player.currentMedia.songPath');
  }

  mediaDuration() {
    return dmt.accessProperty(this.program.state, 'player.currentMedia.duration');
  }

  isStream() {
    return this.program.state.player.isStream;
  }

  stop() {
    this.program.removeStoreElement({ storeName: 'player', key: 'timeLimit' }, { announce: false });

    if (this.isStream()) {
      return new Promise((success, reject) => {
        this.engine
          .stop()
          .then(() => {
            success();
          })
          .catch(reject);
      });
    }

    return new Promise((success, reject) => {
      if (!this.hasLoadedMedia()) {
        success();
      } else {
        this.inProcessOfStopping = true;
        this.playlist.deselectCurrent();
        this.playlist.broadcastPlaylistState();

        this.engine
          .stop()
          .then(success)
          .catch(reject);
      }
    });
  }

  clear() {
    return new Promise((success, reject) => {
      success();
    });
  }

  list() {
    return new Promise((success, reject) => {
      success({ playlist: this.playlist.songList(), currentSongId: this.playlist.currentSongId() });
    });
  }

  status() {
    return new Promise((success, reject) => {
      const status = JSON.parse(JSON.stringify(this.program.state.player));
      delete status.playlist;
      success({ status });
    });
  }

  volume(vol) {
    const prevVolume = this.program.state.player.volume;
    let newVolume;

    const volumeStep = parseInt(dmt.services('player').volumeStep || 10);

    if (vol == 'up') {
      newVolume = Math.min(100, prevVolume + volumeStep);
    } else if (vol == 'down') {
      newVolume = Math.max(0, prevVolume - volumeStep);
    } else if (!isNaN(parseInt(vol))) {
      newVolume = parseInt(vol);
      if (newVolume < 0) {
        newVolume = 0;
      }
      if (newVolume > 100) {
        log.magenta(`Invalid volume value passed (vol = ${colors.red(vol)}) — ${colors.red('not adjusting volume')}`);
        newVolume = prevVolume;

        return new Promise((success, reject) => {
          success({
            prevVolume,
            volume: prevVolume
          });
        });
      }
    }

    return new Promise((success, reject) => {
      this.engine
        .volume(newVolume)
        .then(volume => {
          success({
            prevVolume,
            volume
          });
        })
        .catch(reject);
    });
  }
}

export default LocalPlayer;
