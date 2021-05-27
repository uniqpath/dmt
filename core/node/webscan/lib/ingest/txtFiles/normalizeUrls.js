import dmt from 'dmt/bridge';
const { util } = dmt;
const { normalizeUrl } = util;

export default function normalizeUrls(urls) {
  return urls.map(entry => {
    return { ...entry, url: normalizeUrl(entry.url) };
  });
}
