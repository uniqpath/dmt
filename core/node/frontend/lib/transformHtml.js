export default function transformHTML(req, res, next) {
  const { write } = res;
  res.write = (chunk, encoding) => {
    if (res.getHeader('Content-Type').indexOf('text/html') > -1 && (req.path == '/' || req.path.toLowerCase() == '/index.html')) {
      if (req.query.q) {
        chunk = chunk.toString().replaceAll('ZetaSeek Search & Discovery', `🔎 ${req.query.q}`);
      }
      res.setHeader('Content-Length', chunk.length);
    }
    write.call(res, chunk, encoding);
  };

  next();
}
