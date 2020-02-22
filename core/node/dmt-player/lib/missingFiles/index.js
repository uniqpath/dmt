import dmt from 'dmt-bridge';

const { processBatch } = dmt;

import asyncMap from './asyncMap';

class MissingFiles {
  constructor({ playlist }) {
    this.playlist = playlist;
  }

  detect(songList) {
    const entries = songList.filter(song => !song.asyncCheckingMissingFile);

    if (entries.length == 0) {
      return;
    }

    entries.forEach(song => {
      song.asyncCheckingMissingFile = true;
    });

    processBatch({
      entries,
      asyncMap,
      batchSize: 100,
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
