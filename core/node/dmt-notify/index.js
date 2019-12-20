const apn = require('./lib/apn');
const macos = require('./lib/macos');
const email = require('./lib/email');

module.exports = { push: apn, desktop: macos, email: email };
