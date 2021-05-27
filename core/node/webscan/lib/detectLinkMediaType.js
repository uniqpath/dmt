export default function detectLinkMediaType(url) {
  if (url.endsWith('.pdf')) {
    return 'pdf';
  }
}
