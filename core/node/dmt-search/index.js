import SearchClient from './lib/searchClient';
import MusicSearch from './lib/mediaSearch/musicSearch';
import VideoSearch from './lib/mediaSearch/videoSearch';
import { parseArgs, serializeArgs } from './lib/args';

import initActor from './actor';

function init(program) {
  initActor(program);
}

export { init, parseArgs, serializeArgs, SearchClient, MusicSearch, VideoSearch };
