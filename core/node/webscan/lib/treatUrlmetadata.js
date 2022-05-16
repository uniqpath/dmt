import { util } from 'dmt/common';

function limitDescription(str) {
  return util.limitString(str, 1200);
}

export default function treatUrlmetadata(urlmetadata) {
  if (urlmetadata?.open_graph?.description) {
    urlmetadata.open_graph.description = limitDescription(urlmetadata.open_graph.description);
  }

  if (urlmetadata?.twitter_card?.description) {
    urlmetadata.twitter_card.description = limitDescription(urlmetadata.twitter_card.description);
  }

  if (urlmetadata?.description) {
    urlmetadata.description = limitDescription(urlmetadata.description);
  }

  return urlmetadata;
}
