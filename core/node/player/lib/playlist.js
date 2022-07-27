import { homedir } from 'os';
import path from 'path';

import { log, util, numberRanges, stopwatch } from 'dmt/common';

import { detectMediaType, searchPredicate } from 'dmt/search';

import MetadataReader from './metadataReader/index.js';
import MissingFiles from './missingFiles/index.js';

const MAX_LOOK_BEHIND = 3;

const DIRECT_PLAY_ROLLOVER_TRIGGERING_INDEX = 15;

class Playlist {
  constructor({ program }) {
    this.program = program;

    this.metadataReader = new MetadataReader({ playlist: this });
    this.missingFiles = new MissingFiles({ playlist: this });

    program.on('tick', () => {
      const playlistMetadata = program.slot('playlistMetadata').get();

      if (playlistMetadata) {
        const deselectAfterSeconds = 30;

        if (!playlistMetadata.lastSelectedAt) {
          this.deselectAll();
        } else if (Date.now() - playlistMetadata.lastSelectedAt > deselectAfterSeconds * 1000) {
          this.deselectAll();
          program.slot('playlistMetadata').removeKey('lastSelectedAt', { announce: false });
        }
      }
    });
  }

  init(currentSongPath, isStream) {
    let updatedFromMpvPlayerState = false;

    this.currentIndex = null;

    this.program.slot('playlist').makeArray();

    this.playlist = this.program.slot('playlist').get();

    this.program.slot('playlistMetadata').update({ playlistLength: this.playlist.length }, { announce: false });

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

  selectMedia(songId) {
    this.cutMarked();

    return new Promise((success, reject) => {
      let matchingIndex;

      this.playlist.forEach((song, index) => {
        if (song.id == songId) {
          matchingIndex = index;
        }
      });

      if (matchingIndex == null) {
        reject(new Error(`No songId ${songId}`));
        return;
      }

      this.currentIndex = matchingIndex;

      if (this.currentIndex >= DIRECT_PLAY_ROLLOVER_TRIGGERING_INDEX) {
        this.rollover();
      }

      this.broadcastPlaylistState();

      success();
    });
  }

  selectNextMedia() {
    this.cutMarked();

    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex += 1;
      return this.currentIndex;
    }

    if (this.playlist.length == 1) {
      return;
    }

    if (this.playlist.length > 0) {
      this.currentIndex = 0;
      return this.currentIndex;
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
    log.write('Cleared playlist');
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
    return f.replace(/^~/, homedir());
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

  cut(args = '', { fromGui = false } = {}) {
    if (this.cutInProgress) {
      return;
    }

    this.cutInProgress = true;

    clearTimeout(this.chanceToPasteTimer);

    this.cutMarked();

    const rangePatternOrStr = Array.isArray(args) ? args.join(' ') : args;

    if (rangePatternOrStr.match(/[a-zA-Z]/)) {
      this.cutSearch(rangePatternOrStr);
      this.cutInProgress = false;
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
          this.broadcastPlaylistState({ skipDiffing: true });
          break;
        }
      }
    }

    this.cutInProgress = false;
  }

  cutSearch(terms) {
    let found = false;

    for (const songInfo of this.playlist) {
      const searchBase = `${songInfo.title} ${songInfo.path}`;

      if (songInfo.id != this.currentSongId() && searchPredicate(searchBase, terms)) {
        songInfo.aboutToBeCut = true;
        found = true;
      }
    }

    if (found) {
      this.broadcastPlaylistState({ skipDiffing: true });

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
          path: songInfo.path,
          metadata: songInfo.metadata
        };
      });

    if (this.clipboard.length == 0) {
      this.clipboard = null;
    } else {
      this.chanceToPasteTimer = setTimeout(() => {
        this.clipboard = null;
        this.broadcastPlaylistState({ skipDiffing: true });
      }, 5000);

      const prevCutCount = this.playlist.filter(songInfo => songInfo.id < this.currentSongId() && songInfo.aboutToBeCut).length;

      this.playlist = this.playlist.filter(songInfo => !songInfo.aboutToBeCut);

      this.currentIndex -= prevCutCount;

      this.renumberPlaylist();
      this.broadcastPlaylistState({ skipDiffing: true });
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
      this.broadcastPlaylistState({ skipDiffing: true });
    }
  }

  setSelectedAsNext() {
    if (this.playlist.find(songInfo => songInfo.selected)) {
      this.cutSelected();
      this.paste();
    }
  }

  bump(rangePattern) {
    if (rangePattern) {
      const songIDs = numberRanges.orderedMatchingNumbers({ rangePattern });
      return this.bumpSongIDs(songIDs);
    }
  }

  bumpSelected() {
    const result = this.bumpSongIDs(this.selectedIDs());
    this.deselectAll();
    return result;
  }

  bumpSearch(terms) {
    return this.bumpSongIDs(this.searchPlaylist(terms));
  }

  searchPlaylist(terms) {
    const currentSongId = this.currentSongId();

    const songIDs = this.playlist
      .filter(songInfo => songInfo.id != currentSongId)
      .filter(songInfo => {
        return terms
          .split(',')
          .filter(terms => terms.trim())
          .find(terms => {
            const searchBase = `${songInfo.title || ''} ${songInfo.path}`;
            return searchPredicate(searchBase, terms);
          });
      })
      .map(songInfo => songInfo.id);

    return songIDs;
  }

  songsToBump(songIDs) {
    return this.playlist.filter(songInfo => songIDs.includes(songInfo.id) && songInfo.id != this.currentSongId());
  }

  clearJustBumped() {
    if (this.playlist.find(({ justBumped }) => justBumped)) {
      this.playlist.forEach(songInfo => delete songInfo.justBumped);
      this.broadcastPlaylistState();
    }
  }

  bumpSongIDs(songIDs) {
    const insertSongList = this.songsToBump(songIDs);

    const prevBumpedCount = insertSongList.filter(songInfo => songInfo.id < this.currentSongId()).length;

    this.playlist = this.playlist.filter(songInfo => !songIDs.includes(songInfo.id) || songInfo.id == this.currentSongId());

    this.currentIndex -= prevBumpedCount;

    insertSongList.forEach(songInfo => {
      songInfo.justBumped = true;
    });

    clearTimeout(this.justBumpedHighlightTimer);
    this.clearJustBumped();
    this.justBumpedHighlightTimer = setTimeout(() => {
      this.clearJustBumped();
    }, 1000);

    this.playlist.splice(this.currentIndex + 1, 0, ...util.shuffle(insertSongList));

    this.renumberPlaylist();
    this.broadcastPlaylistState({ skipDiffing: true });

    return insertSongList.map(song => {
      return { title: song.title, path: song.path };
    });
  }

  similar() {
    const currentSongId = this.currentSongId();
    if (currentSongId) {
      const currentSongDir = path.dirname(this.currentSong().path);
      const songIDs = this.playlist.filter(songInfo => path.dirname(songInfo.path) == currentSongDir).map(songInfo => songInfo.id);
      return this.bumpSongIDs(songIDs);
    }
  }

  insert(files) {
    const playlist = files.map((file, index) => {
      return { path: this.fixFilePath(file) };
    });

    this.playlist.splice(this.currentIndex + 1, 0, ...playlist);

    this.renumberPlaylist();
    this.broadcastPlaylistState({ skipDiffing: true });
  }

  renumberPlaylist() {
    const baseId = this.currentSongId() || 1;

    this.playlist.slice(this.currentIndex).forEach((song, index) => {
      song.id = baseId + index;
    });

    if (this.currentIndex == null && this.playlist.length > 0) {
      this.currentIndex = 0;
    }
  }

  deselectAll() {
    if (this.playlist && this.playlist.find(songInfo => songInfo.selected)) {
      this.playlist.forEach(songInfo => delete songInfo.selected);
      this.broadcastPlaylistState();
    }
  }

  toggleSelected(songId) {
    this.playlist.forEach(songInfo => {
      if (songInfo.id == songId) {
        songInfo.selected = !songInfo.selected;

        this.broadcastPlaylistState();

        this.timestampLastSelected();
      }
    });
  }

  timestampLastSelected() {
    this.program.slot('playlistMetadata').update(
      {
        lastSelectedAt: Date.now()
      },
      { announce: false }
    );
  }

  shuffle() {
    if (this.currentIndex < this.playlist.length) {
      const { limit } = this.program.slot('player').get();

      const splitPoint = this.currentIndex + 1 + (limit ? limit - 1 : 0);

      const prevArr = this.playlist.slice(0, splitPoint);
      const nextArr = this.playlist.slice(splitPoint);

      this.playlist = prevArr.concat(util.shuffle(nextArr));

      this.renumberPlaylist();
      this.broadcastPlaylistState({ skipDiffing: true });
    }
  }

  rescanMissingMedia() {
    this.missingFiles.rescan(this.playlist);
  }

  markError(song) {
    if (!song.error) {
      song.error = true;
      this.broadcastPlaylistState();
    }
  }

  unmarkError(song) {
    if (song.error) {
      delete song.error;
      this.broadcastPlaylistState();
    }
  }

  removeMissingMedia() {
    function excludeMissing(playlist) {
      return playlist.filter(song => !song.error);
    }

    if (this.playlist.length > 0) {
      const beforeCurrent = excludeMissing(this.playlist.slice(0, this.currentIndex));
      const fromCurrent = excludeMissing(this.playlist.slice(this.currentIndex));

      this.playlist = beforeCurrent.concat(fromCurrent);

      if (this.playlist.length > 0) {
        const missingBefore = this.currentIndex - beforeCurrent.length;
        this.currentIndex -= missingBefore;
      } else {
        this.currentIndex = null;
      }
    }

    this.renumberPlaylist();
    this.broadcastPlaylistState({ skipDiffing: true });
  }

  broadcastPlaylistState({ skipDiffing = false } = {}) {
    const numberOfMissingMedia = this.playlist.filter(song => song.error).length;
    const { metadataReadCount } = this.updatePlaylistDerivedData();
    const playlistSelectedCount = this.playlist.filter(songInfo => songInfo.selected && !songInfo.aboutToBeCut && songInfo.id != this.currentSongId()).length;
    const playlistHasSelectedEntries = playlistSelectedCount > 0;
    this.program.store().update(
      {
        player: { hasMissingMedia: numberOfMissingMedia > 0 },
        playlist: util.clone(this.playlist),
        playlistMetadata: {
          playlistLength: this.playlist.length,
          numberOfMissingMedia,
          metadataReadCount,
          playlistSelectedCount,
          playlistHasSelectedEntries,
          playlistClipboard: this.clipboard ? this.clipboard.length : 0
        }
      },
      { skipDiffing }
    );
  }

  updatePlaylistDerivedData() {
    const { limit } = this.program.slot('player').get();

    let prevSong;
    let metadataReadCount = 0;

    for (const song of this.playlist) {
      const titleFromFilePath = song.path.split('/').slice(-1)[0];

      const { metadata } = song;

      if (metadata?.artist && metadata?.title) {
        const { artist, title } = song.metadata;
        song.title = `${artist} - ${title}`;
      } else if (metadata?.title) {
        song.title = metadata.title;
      } else {
        song.title = titleFromFilePath;
      }

      if (!song.mediaType) {
        song.mediaType = detectMediaType(song.path);
      }

      if (song.metadata) {
        metadataReadCount += 1;
      }

      song.past = song.id < this.currentSongId();
      song.current = song.id == this.currentSongId();

      if (limit == null || song.past) {
        delete song.withinLimit;
      }

      const assignAlbumTitle = song => {
        if (song.metadata && !song.metadata.error && song.metadata.artist && song.metadata.album) {
          const title = `${song.metadata.artist} - ${song.metadata.album}`;
          song.albumTitle = song.metadata.year ? `${title} (${song.metadata.year})` : title;
        }
      };

      delete song.albumTitle;

      if (prevSong) {
        if (path.dirname(prevSong.path) == path.dirname(song.path)) {
          song.directoryTogetherness = prevSong.directoryTogetherness;
        } else {
          song.directoryTogetherness = 1 - prevSong.directoryTogetherness;
          assignAlbumTitle(song);
        }
      } else {
        song.directoryTogetherness = 0;
        assignAlbumTitle(song);
      }

      prevSong = song;
    }

    setTimeout(() => {
      this.metadataReader.readTags(this.playlist);
    }, 100);

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

    return { metadataReadCount };
  }

  rollover() {
    const diff = this.currentIndex - MAX_LOOK_BEHIND;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const firstEl = this.playlist.shift();
        this.playlist.push(firstEl);

        this.currentIndex -= 1;
      }

      this.renumberPlaylist();
      this.broadcastPlaylistState({ skipDiffing: true });
    }
  }
}

export default Playlist;
