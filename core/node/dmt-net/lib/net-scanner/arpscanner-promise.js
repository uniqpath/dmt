const scanner = require('./arpscanner');

module.exports = options =>
  new Promise((resolve, reject) => {
    scanner((err, out) => (err ? reject(err) : resolve(out)), options);
  });
