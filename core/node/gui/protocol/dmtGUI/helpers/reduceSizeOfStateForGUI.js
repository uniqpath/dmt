export default function reduceSizeOfStateForGUI(state) {
  const PLAYLIST_MAX_SIZE = 50;

  if (state.playlist && state.playlist.length > PLAYLIST_MAX_SIZE) {
    const trimmedPlaylist = state.playlist.slice(0, PLAYLIST_MAX_SIZE);
    state.playlist = trimmedPlaylist;
    return state;
  }

  return state;
}
