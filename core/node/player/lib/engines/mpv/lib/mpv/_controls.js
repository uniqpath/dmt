const controls = {
  togglePause() {
    return this.socket.cycleProperty('pause');
  },
  pause() {
    return this.socket.setProperty('pause', true);
  },
  resume() {
    return this.socket.setProperty('pause', false);
  },
  play() {
    return this.socket.setProperty('pause', false);
  },
  stop() {
    return this.socket.command('stop', []);
  },
  volume(value) {
    return this.socket.setProperty('volume', value);
  },

  adjustVolume(value) {
    return this.socket.addProperty('volume', value);
  },
  mute() {
    return this.socket.setProperty('mute', true);
  },
  unmute() {
    return this.socket.setProperty('mute', false);
  },
  toggleMute() {
    return this.socket.cycleProperty('mute');
  },
  seek(seconds) {
    return this.socket.command('seek', [seconds, 'relative']);
  },
  goToPosition(seconds) {
    return this.socket.command('seek', [seconds, 'absolute']);
  },
  loop(times) {
    return this.socket.setProperty('loop', times);
  }
};

export default controls;
