import fs from 'fs';

export default function asyncMap(song) {
  return new Promise(success => {
    fs.access(song.path, fs.constants.R_OK, err => {
      if (err) {
        song.error = true;
      } else {
        delete song.error;
      }

      success(song);
    });
  });
}
