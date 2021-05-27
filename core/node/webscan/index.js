import dmt from 'dmt/bridge';
import detectLinkMediaType from './lib/detectLinkMediaType';

function init(program) {
  program.on('ready', () => {});
}

export { init, detectLinkMediaType };
