import fs from 'fs';

import dmt from 'dmt/common';
const { log, util } = dmt;

const pulseaudio = fs.existsSync('/etc/pulse/default.pa');
const WORKAROUND = process.platform == 'linux' && !pulseaudio;

function resetAlsaIfLongIdle(mpv, idleSince) {
  if (WORKAROUND && !pulseaudio) {
    if (idleSince && Date.now() - idleSince) {
      const diffSeconds = (Date.now() - idleSince) / 1000;
      const diffHours = diffSeconds / 3600;
      if (diffHours > 8) {
        log.magenta(`Idle for ${util.round(diffHours)} hours, implementing ALSA HACK!`);
        return resetAlsa(mpv);
      }
    }
  }

  return new Promise(success => success());
}

function resetAlsa(mpv, playerState) {
  if (WORKAROUND && !pulseaudio) {
    const currentMedia = playerState && playerState.currentMedia && playerState.currentMedia.songPath;
    if (!currentMedia || playerState.paused) {
      const delay = 50;

      log.magenta('Restarting alsa on mpv player init or play after long idle (> 12h) (alsa bug workaround)');

      return new Promise((success, reject) => {
        mpv.setProperty('audio-device', 'null').then(() => {
          setTimeout(() => {
            mpv.setProperty('audio-device', 'auto').then(() => {
              setTimeout(() => {
                mpv.getProperty('audio-device').then(() => {
                  success();
                });
              }, delay);
            });
          }, delay);
        });
      });
    }
  }

  return new Promise(success => success());
}

export { resetAlsa, resetAlsaIfLongIdle };
