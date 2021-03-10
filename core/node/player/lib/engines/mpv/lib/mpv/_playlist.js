const playlist = {
  clearPlaylist() {
    return this.socket.command('playlist-clear');
  }
};

export default playlist;
