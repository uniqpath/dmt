function queryDifferentEnough({ searchQuery, prevQuery, searchMode, prevSearchMode }) {
  return normalizeQuery(searchQuery) != normalizeQuery(prevQuery) || searchMode != prevSearchMode;
}

function normalizeQuery(query) {
  return query ? query.trim().replace(/\s+/g, ' ') : query;
}

let prevQuery = '';
let prevSearchMode;
let executeQueryTimeout;
const timeTags = [];

const SEARCH_LAG_MS = 300;

function executeSearch({
  searchQuery,
  searchMode,
  remoteObject,
  remoteMethod,
  searchStatusCallback = () => {},
  searchDelay = SEARCH_LAG_MS,
  force,
  searchMetadata
}) {
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
      prevSearchMode = searchMode;

      return;
    }

    try {
      if (force || queryDifferentEnough({ searchQuery, prevQuery, searchMode, prevSearchMode })) {
        clearTimeout(executeQueryTimeout);

        searchStatusCallback({ searching: true });
        prevQuery = searchQuery;
        prevSearchMode = searchMode;

        executeQueryTimeout = setTimeout(() => {
          const timeTag = Date.now();
          timeTags.push(timeTag);

          console.log(`Search executed on remote object: ${searchQuery}`);

          remoteObject
            .call(remoteMethod, { query: normalizeQuery(searchQuery), searchMode, searchMetadata })
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

              console.log('executeSearch ERROR:');
              console.log(e);

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
