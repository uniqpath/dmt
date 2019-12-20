const information = {
  isMuted() {
    return this.getProperty('mute');
  },
  isPaused() {
    return this.getProperty('pause');
  },
  isSeekable() {
    return this.getProperty('seekable');
  },

  getDuration() {
    return this.getProperty('duration');
  },

  getTimePosition() {
    return this.getProperty('time-pos');
  },
  getPercentPosition() {
    return this.getProperty('percent-pos');
  },
  getTimeRemaining() {
    return this.getProperty('time-remaining');
  },
  getMetadata() {
    return this.getProperty('metadata');
  },
  getTitle() {
    return this.getProperty('media-title');
  },
  getArtist() {
    return this.getMetadata().then(metadata => metadata && metadata.artist);
  },
  getAlbum() {
    return this.getMetadata().then(metadata => metadata && metadata.album);
  },
  getYear() {
    return this.getMetadata().then(metadata => metadata && metadata.date);
  },
  getFilename(format = 'full') {
    if (!['stripped', 'full'].includes(format)) {
      return Promise.reject(
        this.errorHandler.errorMessage(1, 'getFilename()', [format], null, {
          full: 'the full path to the file (default)',
          stripped: 'stripped path without the full path in fron of it'
        })
      );
    }

    return this.getProperty(format === 'stripped' ? 'filename' : 'path');
  }
};

module.exports = information;
