import noteResults from './noteResults';
import readNotes from './readNotes';

let notesCache;

function allNotes() {
  return new Promise((success, reject) => {
    if (notesCache) {
      success(notesCache);
    } else {
      readNotes().then(notes => {
        notesCache = notes;
        success(notes);
      });
    }
  });
}

function noteSearch({ terms, page = 1, count, mediaType }) {
  const maxResults = count;

  const initialResultsToIgnore = (page - 1) * maxResults;

  return new Promise(success => {
    allNotes().then(notes => {
      const allResults = noteResults(terms, notes);

      const results = allResults.slice(initialResultsToIgnore).slice(0, maxResults);

      const resultsFrom = (page - 1) * maxResults + 1;
      const resultsTo = resultsFrom + results.length - 1;
      const noMorePages = results.length < maxResults;
      const resultCount = results.length;

      const meta = { page, resultsFrom, resultsTo, noMorePages, resultCount };

      success({ results, meta });
    });
  });
}

export default noteSearch;
