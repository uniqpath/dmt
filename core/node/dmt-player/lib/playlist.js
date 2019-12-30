const fs = require('fs');
const path = require('path');
const dmt = require('dmt-bridge');
const { log, util, numberRanges, search, stopwatch } = dmt;

const homedir = require('homedir');
const stripAnsi = require('strip-ansi');

const MAX_LOOK_BEHIND = 3;

const DIRECT_PLAY_ROLLOVER_TRIGGERING_INDEX = 15;

class Playlist {
  constructor({ program }) {
    this.program = program;
  }

  init(currentSongPath, isStream) {
    let updatedFromMpvPlayerState = false;

    this.currentIndex = null;

    if (!this.program.state.playlist) {
      this.program.updateState({ playlist: [] }, { announce: false });
    }

    if (!this.program.state.playlistMetadata) {
      this.program.updateState({ playlistMetadata: {} }, { announce: false });
    }

    this.playlist = this.program.state.playlist;

    this.program.updateState({ playlistMetadata: { playlistLength: this.playlist.length } }, { announce: false });

    if (currentSongPath) {
      for (const [index, song] of this.playlist.entries()) {
        if (song.path == currentSongPath) {
          this.currentIndex = index;
          updatedFromMpvPlayerState = true;
          this.updatePlaylistDerivedData();
          break;
        }
      }
    }

    if (this.playlist.length > 0 && this.currentIndex == null) {
      this.playlist.forEach((song, index) => {
        if (song.current) {
          this.currentIndex = index;
        }
      });
    }

    if (currentSongPath && this.currentIndex == null && !isStream) {
      log.red('Current playing state out of sync with saved dmt state, clearing mpv player state ...');
      this.engine.clearState();
    }

    return { updatedFromMpvPlayerState };
  }

  songList() {
    return this.playlist;
  }

  currentSong() {
    return this.playlist[this.currentIndex];
  }

  currentSongId() {
    return this.currentIndex == null ? undefined : this.playlist[this.currentIndex].id;
  }

  selectSong(songId) {
    this.cutMarked();

    return new Promise((success, reject) => {
      let matchingIndex;
      this.playlist.forEach((song, index) => {
        if (song.id == songId) {
          matchingIndex = index;
        }
      });
      if (matchingIndex != null) {
        this.currentIndex = matchingIndex;
        if (this.currentIndex >= DIRECT_PLAY_ROLLOVER_TRIGGERING_INDEX) {
          this.rollover();
        }
        this.broadcastPlaylistState();
        success();
      } else {
        reject();
      }
    });
  }

  selectNextSong() {
    this.cutMarked();

    let index = this.currentIndex + 1;

    if (index < this.playlist.length) {
      this.currentIndex = index;
      return index;
    }

    if (this.playlist.length == 1) {
      return;
    }

    if (this.playlist.length > 0) {
      index = 0;
      this.currentIndex = index;
      return index;
    }
  }

  deselectCurrent() {
    const currentSong = this.playlist.find(songInfo => songInfo.selected && songInfo.id == this.currentSongId());
    if (currentSong) {
      delete currentSong.selected;
    }
  }

  count() {
    return this.playlist.length;
  }

  clear() {
    this.currentIndex = null;
    this.playlist = [];
  }

  prepareNumbering() {
    this.currentIndex = 0;
  }

  isEmpty() {
    return this.playlist.length == 0;
  }

  fixFilePath(f) {
    return stripAnsi(f).replace(/^~/, homedir());
  }

  add(files) {
    const idBase = this.playlist.length > 0 ? this.playlist[this.playlist.length - 1].id : 0;

    files = files.map(f => this.fixFilePath(f));
    const playlist = files.map((file, index) => {
      return { id: idBase + index + 1, path: file };
    });

    this.playlist.push(...playlist);

    if (this.playlist.length > 0 && this.currentIndex == null) {
      this.currentIndex = 0;

      this.broadcastPlaylistState();

      return this.playlist[0].path;
    }

    this.broadcastPlaylistState();
  }

  selectedIDs() {
    return this.playlist.filter(songInfo => songInfo.selected).map(songInfo => songInfo.id);
  }

  cut(args, { fromGui = false } = {}) {
    clearTimeout(this.chanceToPasteTimer);

    this.cutMarked();

    const rangePatternOrStr = args.join(' ');

    if (rangePatternOrStr.match(/[a-zA-Z]/)) {
      this.cutSearch(rangePatternOrStr);
      return;
    }

    const rangePattern = args;

    if (rangePattern.length > 0) {
      this.markForCutting(rangePattern);
      if (fromGui) {
        this.cutMarked();
      } else {
        this.cutTimerID = setTimeout(() => this.cutMarked(), 500);
      }
    } else if (this.playlist.find(songInfo => songInfo.selected)) {
      this.cutSelected();
    } else {
      for (let i = this.currentIndex + 1; i < this.playlist.length; i++) {
        if (!this.playlist[i].withinLimit) {
          this.playlist.splice(i, this.playlist.length);
          this.broadcastPlaylistState();
          break;
        }
      }
    }
  }

  cutSearch(terms) {
    let found = false;

    for (const songInfo of this.playlist) {
      if (songInfo.id != this.currentSongId() && search.match(songInfo.title, terms)) {
        songInfo.aboutToBeCut = true;
        found = true;
      }
    }

    if (found) {
      this.broadcastPlaylistState();

      this.cutTimerID = setTimeout(() => this.cutMarked(), 500);
    }
  }

  cutSelected() {
    this.cut(this.selectedIDs(), { fromGui: true });
  }

  markForCutting(rangePattern) {
    if (this.isEmpty()) {
      return;
    }

    if (rangePattern) {
      const parsed = numberRanges.parse(rangePattern);

      const currentSongId = this.currentSongId();

      for (const songInfo of this.playlist) {
        if (songInfo.id != currentSongId && numberRanges.numberMatches(songInfo.id, { parsed })) {
          songInfo.aboutToBeCut = true;
        }
      }

      this.clipboard = null;
    }

    this.broadcastPlaylistState();
  }

  cutMarked() {
    clearTimeout(this.cutTimerID);

    this.clipboard = this.playlist
      .filter(songInfo => songInfo.aboutToBeCut)
      .map(songInfo => {
        return {
          path: songInfo.path
        };
      });

    if (this.clipboard.length == 0) {
      this.clipboard = null;
    } else {
      this.chanceToPasteTimer = setTimeout(() => {
        this.clipboard = null;
        this.broadcastPlaylistState();
      }, 10000);

      const prevCutCount = this.playlist.filter(songInfo => songInfo.id < this.currentSongId() && songInfo.aboutToBeCut).length;

      this.playlist = this.playlist.filter(songInfo => !songInfo.aboutToBeCut);

      this.currentIndex -= prevCutCount;

      this.renumberPlaylist();
      this.broadcastPlaylistState();
    }
  }

  paste() {
    if (this.clipboard) {
      const pasted = this.clipboard.map(songInfo => Object.assign(songInfo, { justPasted: true }));

      this.playlist.splice(this.currentIndex + 1, 0, ...pasted);

      clearTimeout(this.justPastedHighlightTimer);

      this.justPastedHighlightTimer = setTimeout(() => {
        this.playlist.forEach(songInfo => delete songInfo.justPasted);
        this.broadcastPlaylistState();
      }, 1000);

      this.clipboard = null;

      this.renumberPlaylist();
      this.broadcastPlaylistState();
    }
  }

  bump(rangePattern) {
    if (rangePattern) {
      const songIDs = numberRanges.orderedMatchingNumbers({ rangePattern });
      this.bumpSongIDs(songIDs);
    }
  }

  bumpSelected() {
    this.bumpSongIDs(this.selectedIDs());
    this.deselectAll();
  }

  bumpSearch(terms) {
    const currentSongId = this.currentSongId();

    const songIDs = this.playlist.filter(songInfo => songInfo.id > currentSongId && search.match(songInfo.title, terms)).map(songInfo => songInfo.id);
    this.bumpSongIDs(songIDs);
  }

  bumpSongIDs(songIDs) {
    const insertSongList = this.playlist.filter(songInfo => songIDs.includes(songInfo.id) && songInfo.id != this.currentSongId());

    const prevBumpedCount = insertSongList.filter(songInfo => songInfo.id < this.currentSongId()).length;

    this.playlist = this.playlist.filter(songInfo => !songIDs.includes(songInfo.id) || songInfo.id == this.currentSongId());

    this.currentIndex -= prevBumpedCount;

    this.playlist.splice(this.currentIndex + 1, 0, ...insertSongList);

    this.renumberPlaylist();
    this.broadcastPlaylistState();
  }

  insert(files) {
    const playlist = files.map((file, index) => {
      return { path: this.fixFilePath(file) };
    });

    this.playlist.splice(this.currentIndex + 1, 0, ...playlist);

    this.renumberPlaylist();
    this.broadcastPlaylistState();
  }

  renumberPlaylist() {
    const baseId = this.currentSongId();

    this.playlist.slice(this.currentIndex).forEach((song, index) => {
      song.id = baseId + index;
    });
  }

  deselectAll() {
    this.playlist.forEach(songInfo => delete songInfo.selected);
    this.broadcastPlaylistState();
  }

  toggleSelected(songId) {
    this.playlist.forEach(songInfo => {
      if (songInfo.id == songId) {
        songInfo.selected = !songInfo.selected;
        this.broadcastPlaylistState();
      }
    });
  }

  shuffle() {
    if (this.currentIndex < this.playlist.length) {
      const { limit } = this.program.state.player;

      const splitPoint = this.currentIndex + 1 + (limit ? limit - 1 : 0);

      const prevArr = this.playlist.slice(0, splitPoint);
      const nextArr = this.playlist.slice(splitPoint);

      this.playlist = prevArr.concat(util.shuffle(nextArr));

      this.renumberPlaylist();
      this.broadcastPlaylistState();
    }
  }

  broadcastPlaylistState() {
    this.updatePlaylistDerivedData();
    const playlistHasSelectedEntries = !!this.playlist.find(songInfo => songInfo.selected && !songInfo.aboutToBeCut && songInfo.id != this.currentSongId());
    const currentSongIsSelected = !!this.playlist.find(songInfo => songInfo.selected && songInfo.id == this.currentSongId());
    this.program.updateState({
      playlist: this.playlist,
      playlistMetadata: { playlistLength: this.playlist.length, playlistHasSelectedEntries, currentSongIsSelected, playlistClipboard: !!this.clipboard }
    });
  }

  updatePlaylistDerivedData() {
    const { limit } = this.program.state.player;

    let prevSong;

    for (const song of this.playlist) {
      song.title = song.path.split('/').slice(-1)[0];

      song.past = song.id < this.currentSongId();
      song.current = song.id == this.currentSongId();

      if (limit == null || song.past) {
        delete song.withinLimit;
      }

      if (prevSong) {
        if (path.dirname(prevSong.path) == path.dirname(song.path)) {
          song.directoryTogetherness = prevSong.directoryTogetherness;
        } else {
          song.directoryTogetherness = 1 - prevSong.directoryTogetherness;
        }
      } else {
        song.directoryTogetherness = 0;
      }

      prevSong = song;
    }

    let offset = 0;
    for (const song of this.playlist.filter(songInfo => songInfo.id >= this.currentSongId())) {
      if (limit != null && !song.aboutToBeCut && offset < limit) {
        song.withinLimit = true;
      } else {
        delete song.withinLimit;
      }

      if (!song.aboutToBeCut) {
        offset += 1;
      }
    }
  }

  markMissingMedia() {
    for (const song of this.playlist) {
      if (!fs.existsSync(song.path)) {
        song.error = true;
      }
    }

    this.broadcastPlaylistState();
  }

  removeMissingMedia() {
    this.playlist = this.playlist.filter(song => fs.existsSync(song.path));

    this.renumberPlaylist();
    this.broadcastPlaylistState();
  }

  rollover() {
    const maxLookBehind = MAX_LOOK_BEHIND;
    const diff = this.currentIndex - maxLookBehind;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const firstEl = this.playlist.shift();
        this.playlist.push(firstEl);

        this.currentIndex -= 1;
      }

      this.renumberPlaylist();
      this.broadcastPlaylistState();
    }
  }
}

module.exports = Playlist;