import { get } from 'svelte/store';

function queryDifferentEnough({ searchQuery, prevQuery, searchMode, prevSearchMode, page, prevPage }) {
  return normalizeQuery(searchQuery) != normalizeQuery(prevQuery) || searchMode != prevSearchMode || page != prevPage;
}

function normalizeQuery(query) {
  return query ? query.trim().replace(/\s+/g, ' ') : query;
}

let prevQuery = '';
let prevPage;
let prevSearchMode;
let executeQueryTimeout;
const timeTags = [];

const SEARCH_LAG_MS = 1300;

function executeSearch({
  searchQuery = '',
  page,
  searchMode,
  selectedTags,
  keepSelectedTags,
  remoteObject,
  remoteMethod,
  searchStatusCallback = () => {},
  searchDelay = SEARCH_LAG_MS,
  force,
  searchMetadata,
  timezone
}) {
  return new Promise((success, reject) => {
    if (searchQuery.trim() == '') {
      timeTags.push(Date.now());

      if (!keepSelectedTags) {
        selectedTags.set({});
      }

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
      prevPage = page;
      prevSearchMode = searchMode;

      return;
    }

    try {
      if (force || queryDifferentEnough({ searchQuery, prevQuery, searchMode, prevSearchMode, page, prevPage })) {
        if (!keepSelectedTags) {
          selectedTags.set({});
        }

        clearTimeout(executeQueryTimeout);

        searchStatusCallback({ searching: true });
        prevQuery = searchQuery;
        prevPage = page;
        prevSearchMode = searchMode;

        executeQueryTimeout = setTimeout(() => {
          const timeTag = Date.now();
          timeTags.push(timeTag);

          console.log(`Search executed on remote object: ${searchQuery}`);

          remoteObject
            .call(remoteMethod, { query: normalizeQuery(searchQuery), page, selectedTags: Object.keys(get(selectedTags)), searchMetadata, timezone })
            .then(searchResults => {
              const lastTimeTag = timeTags[timeTags.length - 1];

              if (timeTag == lastTimeTag) {
                const emptyResults = searchResults.filter(response => response.error || response.results.length == 0);
                const noHits = emptyResults.length == searchResults.length;

                const validResults = searchResults.filter(response => response.results?.length);
                const noMorePages = validResults.filter(response => response.meta.noMorePages).length == validResults.length;

                searchStatusCallback({ searching: false, noHits, noMorePages });
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
