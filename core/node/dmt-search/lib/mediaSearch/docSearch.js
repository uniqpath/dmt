const SearchClient = require('../searchClient.js');

class MusicSearch {
  constructor(providers) {
    this.searchClient = new SearchClient(providers, { mediaType: 'doc' });
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

module.exports = MusicSearch;
