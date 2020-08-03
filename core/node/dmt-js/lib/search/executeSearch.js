function queryDifferentEnough({ searchQuery, prevQuery }) {
  return normalizeQuery(searchQuery) != normalizeQuery(prevQuery);
}

function normalizeQuery(query) {
  return query ? query.trim().replace(/\s+/g, ' ') : query;
}

let prevQuery = '';
let executeQueryTimeout;
const timeTags = [];

const SEARCH_LAG_MS = 300;

function executeSearch({ searchQuery, remoteObject, remoteMethod, searchMetadata, searchDelay = SEARCH_LAG_MS, force, searchStatusCallback = () => {} }) {
  return new Promise((success, reject) => {
    if (searchQuery.trim() == '') {
      timeTags.push(Date.now());

      if (prevQuery != '' || force) {
        clearTimeout(executeQueryTimeout);
        searchStatusCallback({ searching: false });

        if (force) {
          success(null);
        } else {
          success([]);
        }
      }

      prevQuery = searchQuery;

      return;
    }

    try {
      if (force || queryDifferentEnough({ searchQuery, prevQuery })) {
        clearTimeout(executeQueryTimeout);

        searchStatusCallback({ searching: true });
        prevQuery = searchQuery;

        executeQueryTimeout = setTimeout(() => {
          const timeTag = Date.now();
          timeTags.push(timeTag);

          console.log(`Search executed on remote object: ${searchQuery}`);

          const searchOriginHost = window.location.host;
          Object.assign(searchMetadata, { searchOriginHost });

          remoteObject
            .call(remoteMethod, { query: normalizeQuery(searchQuery), searchMetadata })
            .then(searchResults => {
              const lastTimeTag = timeTags[timeTags.length - 1];

              if (timeTag == lastTimeTag) {
                const noHits = searchResults.filter(response => response.error || response.results.length == 0).length == searchResults.length;

                searchStatusCallback({ searching: false, noHits });
                success(searchResults);
              } else {
                console.log('Discarding search result which came out of order because a more recent result is due ...');
              }
            })
            .catch(e => {
              searchStatusCallback({ searching: false });
              reject(e);
            });
        }, searchDelay);
      }
    } catch (e) {
      console.log('This error should not happen: bug in dmt-js');
      searchStatusCallback({ searching: false });
      reject(e);
    }
  });
}

export default executeSearch;
