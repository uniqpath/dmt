import { log, colors } from 'dmt/common';

function userActionHandlers({ program, player }) {
  program
    .dev('dmt')
    .protocol('gui')
    .onUserAction('player', ({ action, payload }) => {
      switch (action) {
        case 'play':
          player.play().catch(log.red);
          break;
        case 'bump':
          player.bump(payload.args).catch(log.red);
          break;
        case 'play_radio': {
          const { radioId } = payload;
          player.playRadio(radioId);
          break;
        }
        case 'pause':
          player.pause().catch(log.red);
          break;
        case 'continue':
          player.continue().catch(log.red);
          break;
        case 'volume_up':
          player.volume('up').catch(log.red);
          break;
        case 'volume_down':
          player.volume('down').catch(log.red);
          break;
        case 'next':
          player.next({ songId: payload?.songId }).catch(log.red);
          break;
        case 'shuffle':
          player.shuffle().catch(log.red);
          break;
        case 'repeat':
          player.repeat();
          break;
        case 'stop':
          player.stop().catch(log.red);
          break;
        case 'set_next':
          player.setNext();
          break;
        case 'backward':
          player.backward(payload ? payload.seconds : undefined).catch(log.red);
          break;
        case 'forward':
          player.forward(payload ? payload.seconds : undefined).catch(log.red);
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
        case 'limit':
          player.limit();
          break;
        case 'similar':
          player.similar();
          break;
        case 'remove_limit':
          player.limit('reset');
          break;
        case 'time_limit':
          player.timeLimit();
          break;
        case 'remove_time_limit':
          player.timeLimit('reset');
          break;
        case 'remove_missing_media':
          player.playlist.removeMissingMedia();
          break;
        case 'sublist':
          player.sublist(payload.tag);
          break;
        default:
          break;
      }
    });
}

export default userActionHandlers;
