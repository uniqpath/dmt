import { processBatch } from 'dmt/common';

import asyncMap from './asyncMap.js';

class MissingFiles {
  constructor({ playlist }) {
    this.playlist = playlist;
  }

  rescan(songList) {
    const missingEntries = songList.filter(song => song.error && !song.asyncCheckingMissingFile);

    if (missingEntries.length == 0) {
      return;
    }

    missingEntries.forEach(song => {
      song.asyncCheckingMissingFile = true;
    });

    processBatch({
      entries: missingEntries,
      asyncMap,
      batchSize: 20,
      afterAsyncResultsBatch: results => {
        results.forEach(song => {
          delete song.asyncCheckingMissingFile;
        });

        this.playlist.broadcastPlaylistState();
      }
    });
  }
}

export default MissingFiles;
