const playlist = {
  clearPlaylist() {
    return this.socket.command('playlist-clear');
  }
};

module.exports = playlist;
