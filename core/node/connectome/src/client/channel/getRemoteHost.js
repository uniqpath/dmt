export default function getRemoteHost(req) {
  if (req.headers && req.headers.origin) {
    return req.headers.origin;
  }
}
