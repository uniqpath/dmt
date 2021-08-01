import deriveTitle from './deriveTitle';
import deriveTags from './deriveTags';
import deriveMediaType from './deriveMediaType';
import deriveSocialPreview from './deriveSocialPreview';

export default function addDerivedData(linkEntry) {
  deriveTitle(linkEntry);
  const tags = deriveTags(linkEntry);
  if (tags) {
    linkEntry.tags = tags;
  }

  const mediaType = deriveMediaType(linkEntry);
  if (mediaType) {
    linkEntry.mediaType = mediaType;
  }

  const preview = deriveSocialPreview(linkEntry.urlmetadata);
  if (preview) {
    linkEntry.preview = preview;
  }

  if (linkEntry.urlmetadata?.favicon) {
    linkEntry.favicon = linkEntry.urlmetadata.favicon;
  }

  delete linkEntry.filePath;
  delete linkEntry.urlmetadata;
  delete linkEntry.manualTags;
}
