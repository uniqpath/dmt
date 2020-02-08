import dmt from 'dmt-bridge';
const { log } = dmt;

function userActionHandlers({ program, player }) {
  program.on('action', ({ action, storeName, payload }) => {
    log.write(`Received user action: ${storeName}::${action}`);

    if (storeName == 'player') {
      switch (action) {
        case 'play':
          player.play().catch(() => {});
          break;
        case 'pause':
          player.pause().catch(() => {});
          break;
        case 'toggle':
          if (program.state.player.paused) {
            player.play().catch(() => {});
          } else {
            player.pause().catch(() => {});
          }
          break;
        case 'volume_up':
          player.volume('up').catch(() => {});
          break;
        case 'volume_down':
          player.volume('down').catch(() => {});
          break;
        case 'forward':
          player.forward(payload.seconds).catch(() => {});
          break;
        case 'play_next':
          player.next().catch(() => {});
          break;
        case 'shuffle_playlist':
          player.shuffle().catch(() => {});
          break;
        case 'repeat_increase':
          player.repeatIncrease();
          break;
        case 'stop':
          player.stop().catch(() => {});
          break;
        case 'insert_selected':
          player.insertSelected();
          break;
        case 'cut_selected':
          player.cutSelected();
          break;
        case 'paste':
          player.paste();
          break;
        case 'select': {
          const { songId } = payload;
          player.toggleSelected(songId);
          break;
        }
        case 'deselect_all': {
          player.playlist.deselectAll();
          break;
        }
        case 'goto': {
          const { percentPos } = payload;
          player.gotoPercentPos(percentPos);
          break;
        }
        case 'limit_increase':
          player.limit();
          break;
        case 'limit_reset':
          player.limit('reset');
          break;
        case 'time_limit_increase':
          player.timeLimit();
          break;
        case 'time_limit_reset':
          player.timeLimit('reset');
          break;
        case 'remove_missing_media':
          player.playlist.removeMissingMedia();
          break;
        case 'play_radio': {
          const { radioId } = payload;
          player.playRadio(radioId);
          break;
        }
        default:
          break;
      }
    }
  });
}

export default userActionHandlers;
