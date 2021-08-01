import { detectLinkMediaType } from 'dmt/webscan';

export default function deriveMediaType({ url }) {
  return detectLinkMediaType(url);
}
