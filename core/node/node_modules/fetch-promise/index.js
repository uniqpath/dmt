const fetchUrl = require('fetch').fetchUrl;

module.exports = (url, options) => {
  return new Promise((resolve, reject) => {
    fetchUrl(url, options, (err, res, buf) => {
      if (err || res.status != 200 || !buf) {
        fetchUrl(encodeURI(url), options, (err, res, buf) => {
          if (err) reject(err);
          else resolve({ res, buf });
        });
      }
      else resolve({ res, buf });
    });
  });
};