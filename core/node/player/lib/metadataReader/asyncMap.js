import ffprobe from './ffprobe/index.js';

import schemaVersion from './metadataSchemaVersion.js';

export default function asyncMap(song) {
  return new Promise((success, reject) => {
    ffprobe({ filePath: song.path })
      .then(metadata => {
        if (metadata.title) {
          song.metadata = { ...metadata, ...{ schemaVersion } };
        } else if (metadata.duration) {
          song.metadata = { duration: metadata.duration, schemaVersion };
        } else {
          song.metadata = { error: true };
        }

        success(song);
      })
      .catch(e => {
        song.metadata = { error: true };
        success(song);
      });
  });
}
