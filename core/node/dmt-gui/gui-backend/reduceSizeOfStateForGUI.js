import dmt from 'dmt-bridge';
const { util } = dmt;

export default function reduceSizeOfStateForGUI(state) {
  const PLAYLIST_MAX_SIZE = 50;

  if (state.playlist && state.playlist.length > PLAYLIST_MAX_SIZE) {
    const trimmedPlaylist = util.clone(state.playlist).slice(0, PLAYLIST_MAX_SIZE);
    return { ...state, ...{ playlist: trimmedPlaylist } };
  }

  return state;
}
