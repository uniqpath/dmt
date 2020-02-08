import SearchClient from '../searchClient';

class VideoSearch {
  constructor(providers) {
    this.searchClient = new SearchClient(providers, { mediaType: 'video' });
  }

  async search(options) {
    return new Promise((success, reject) => {
      this.searchClient
        .search(options)
        .then(success)
        .catch(reject);
    });
  }
}

export default VideoSearch;
