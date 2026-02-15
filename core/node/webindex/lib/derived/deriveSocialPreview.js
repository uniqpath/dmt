export default function(urlmetadata) {
  if (!urlmetadata) {
    return;
  }

  const { twitter_card: twitterCard, open_graph: openGraph } = urlmetadata;
  let imageFormat = 'normal';
  let imageUrl;
  let title;
  let description;

  if (twitterCard) {
    if (twitterCard.card == 'summary_large_image') {
      imageFormat = 'large';
    }

    if (twitterCard.images && twitterCard.images.length > 0) {
      imageUrl = twitterCard.images[0].url;
    }

    title = twitterCard.title;
    description = twitterCard.description;
  }

  if (openGraph) {
    if (!imageUrl && openGraph.images && openGraph.images.length > 0) {
      imageUrl = openGraph.images[0].url;
    }

    if (!title) {
      title = openGraph.title;
    }

    if (!description) {
      description = openGraph.description;
    }
  }

  if (!title) {
    title = urlmetadata.title;
  }

  if (!description) {
    description = urlmetadata.description;
  }

  return { title, description, imageUrl, imageFormat };
}
