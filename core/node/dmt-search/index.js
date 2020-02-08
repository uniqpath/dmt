import SearchClient from './lib/searchClient';
import MusicSearch from './lib/mediaSearch/musicSearch';
import VideoSearch from './lib/mediaSearch/videoSearch';
import aggregateSearchResultsFormatter from './lib/presenters/aggregateResultsFormatter';

import rpcService from './rpc/service';

function init(program) {
  rpcService(program);
}

export { init, SearchClient, MusicSearch, VideoSearch, aggregateSearchResultsFormatter };
