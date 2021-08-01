import { log } from 'dmt/common';

const controls = {
  togglePause() {
    return this.ipc.cycleProperty('pause');
  },
  pause() {
    return this.ipc.setProperty('pause', true);
  },
  resume() {
    return this.ipc.setProperty('pause', false);
  },
  play() {
    return this.ipc.setProperty('pause', false);
  },
  stop() {
    return this.ipc.command('stop', []);
  },
  volume(value) {
    return this.ipc.setProperty('volume', value);
  },

  adjustVolume(value) {
    return this.ipc.addProperty('volume', value);
  },
  mute() {
    return this.ipc.setProperty('mute', true);
  },
  unmute() {
    return this.ipc.setProperty('mute', false);
  },
  toggleMute() {
    return this.ipc.cycleProperty('mute');
  },
  seek(seconds) {
    return this.ipc.command('seek', [seconds, 'relative']);
  },
  goToPosition(seconds) {
    return this.ipc.command('seek', [seconds, 'absolute']);
  },
  loop(times) {
    return this.ipc.setProperty('loop', times);
  }
};

export default controls;
