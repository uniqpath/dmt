import dmt from 'dmt-bridge';
const { log } = dmt;

function userActionHandlers({ program, player }) {
  program.on('action', ({ action, storeName, payload }) => {
    log.write(`Received user action: ${storeName}::${action}`);

    if (storeName == 'player') {
      switch (action) {
        case 'play':
          player.play().catch(log.red);
          break;
        case 'pause':
          player.pause().catch(log.red);
          break;
        case 'toggle':
          if (program.state.player.paused) {
            player.play().catch(log.red);
          } else {
            player.pause().catch(log.red);
          }
          break;
        case 'volume_up':
          player.volume('up').catch(log.red);
          break;
        case 'volume_down':
          player.volume('down').catch(log.red);
          break;
        case 'forward':
          player.forward(payload.seconds).catch(log.red);
          break;
        case 'play_next':
          player.next().catch(log.red);
          break;
        case 'shuffle_playlist':
          player.shuffle().catch(log.red);
          break;
        case 'repeat_increase':
          player.repeat();
          break;
        case 'stop':
          player.stop().catch(log.red);
          break;
        case 'set_next':
          player.setNext();
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
