import path from 'path';

const extensions = {
  music: ['mp3', 'm4a', 'flac', 'ogg'],
  video: ['mp4', 'mkv', 'avi', 'webm'],
  photo: ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'svg'],
  pdf: ['pdf'],
  txt: ['txt']
};

function detectMediaType(filePath) {
  if (!filePath) {
    return;
  }

  const fileExt = path.extname(filePath).toLowerCase();

  for (const mediaType of Object.keys(extensions)) {
    const match = extensions[mediaType].find(ext => `.${ext}` == fileExt);

    if (match) {
      return mediaType;
    }
  }
}

export default detectMediaType;
