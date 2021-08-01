import dmt from 'dmt/common';
const { util } = dmt;

const IGNORED_FILE_NAMES = ['links', 'misc', 'other', 'more', 'main', 'check'];

export default function deriveTags({ filePath, manualTags = [] }) {
  if (filePath.includes('/weblinks/')) {
    filePath = filePath.split('/weblinks/')[1];
  }
  const tags = filePath
    .toLowerCase()
    .replace(/\.txt$/, '')
    .split('/')
    .filter(tag => tag != '')
    .map(tag => util.replaceAll(tag, '\\(', ','))
    .flat()
    .map(tag => util.replaceAll(tag, '\\)', ''))
    .flat()
    .map(tag => util.replaceAll(tag, '_', ' ').split(','))
    .flat()
    .map(tag => tag.trim())
    .filter(tag => !IGNORED_FILE_NAMES.includes(tag));

  return [...new Set(tags.concat(manualTags))].sort();
}
