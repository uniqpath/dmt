import { processBatch, isRPi } from 'dmt/common';

import asyncMap from './asyncMap';

class MetadataReader {
  constructor({ playlist }) {
    this.playlist = playlist;
  }

  readTags(songList) {
    const entries = songList.filter(song => !song.metadata && !song.asyncReadingMetadata);

    if (entries.length == 0) {
      return;
    }

    entries.forEach(song => {
      song.asyncReadingMetadata = true;
    });

    processBatch({
      entries,
      asyncMap,
      batchSize: isRPi() ? 20 : 100,
      firstBatchSize: isRPi() ? 5 : 20,
      batchDelay: isRPi() ? 300 : 0,
      afterAsyncResultsBatch: results => {
        results.forEach(song => {
          delete song.asyncReadingMetadata;
        });

        this.playlist.broadcastPlaylistState();
      }
    });
  }
}

export default MetadataReader;
