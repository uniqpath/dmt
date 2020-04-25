var suspawn = require('../');
var assert = require('assert');
var env = suspawn('env', {
  'env': {
    X_Y: 'Z_~'
  }
});
var output = '';
env.stdout.on('data', function (data) {output+=data;});
env.on('exit', function () {
  assert(/^X_Y=Z_\~$/m.test(output));
});
