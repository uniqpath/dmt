import ffprobe from './ffprobe';

import schemaVersion from './metadataSchemaVersion';

export default function asyncMap(song) {
  return new Promise((success, reject) => {
    ffprobe({ filePath: song.path })
      .then(metadata => {
        if (metadata.title && metadata.artist) {
          song.metadata = { ...metadata, ...{ schemaVersion } };

          const { artist, title } = metadata;
          song.title = `${artist} - ${title}`;
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
