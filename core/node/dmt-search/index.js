const SearchClient = require('./lib/searchClient');
const MusicSearch = require('./lib/mediaSearch/musicSearch');
const VideoSearch = require('./lib/mediaSearch/videoSearch');
const aggregateSearchResultsFormatter = require('./lib/presenters/aggregateResultsFormatter');

const rpcService = require('./rpc/service');

function init(program) {
  rpcService(program);
}

module.exports = { init, SearchClient, MusicSearch, VideoSearch, aggregateSearchResultsFormatter };
