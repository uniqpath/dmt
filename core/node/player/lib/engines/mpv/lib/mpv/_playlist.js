const playlist = {
  clearPlaylist() {
    return this.ipc.command('playlist-clear');
  }
};

export default playlist;
