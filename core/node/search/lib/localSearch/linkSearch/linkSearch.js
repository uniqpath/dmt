import { entireLinkIndex } from 'dmt/webindex';

import addSiteTag from './addSiteTag';
import linkQueryResults from './linkQueryResults';
import superTagcloud from './superTagcloud/superTagcloud';

import sortLinks from '../../sortResults/sortLinks';

import { tags } from 'dmt/common';
const { createTagcloud } = tags;

function linkSearch({ terms, selectedTags, page = 1, count }) {
  const maxResults = count;

  const initialResultsToIgnore = (page - 1) * maxResults;

  return new Promise(success => {
    entireLinkIndex().then(linkIndex => {
      const resultsBasedOnQuery = linkQueryResults({ terms, linkIndex, selectedTags });

      const _tagcloud = createTagcloud(resultsBasedOnQuery.filter(({ queryScore }) => queryScore > 0));

      const resultsFilteredBySelectedTags = sortLinks(
        resultsBasedOnQuery
          .map(result => {
            delete result.queryScore;
            return result;
          })
          .filter(({ score }) => score > 0)
      );

      const tagcloud = superTagcloud({ tagcloud: _tagcloud, results: resultsFilteredBySelectedTags, selectedTags });

      const results = resultsFilteredBySelectedTags
        .slice(initialResultsToIgnore)
        .slice(0, maxResults)
        .map(result => addSiteTag(result));

      const resultsFrom = (page - 1) * maxResults + 1;
      const resultsTo = resultsFrom + results.length - 1;
      const noMorePages = results.length < maxResults;
      const resultCount = results.length;

      const meta = { page, resultsFrom, resultsTo, noMorePages, resultCount };

      success({ results, meta, tagcloud });
    });
  });
}

export default linkSearch;
