var spawn = require('child_process').spawn;

var suspawn = module.exports = function (command, args, options) {
  return spawn.apply(null, suspawn.getSpawnOptions(command, args, options));
}

suspawn.getSpawnOptions = function (command, args, options) {
  if (!Array.isArray(args)) {
    options = args;
    args = [];
  }
  if (!options) {
    options = {};
  }
  if (!args) {
    args = [];
  }
  args = ['--', 'sh', '-c'].concat([command].concat(args).map(function(s){return s.replace(/\W/g,'\\$&')}).join(' '));
  if (options.env) {
    Object.keys(options.env).forEach(function (key) {
      var val = key+'='+(options.env[key]+'');
      args.unshift(val);
    });
    // We should reset the env to avoid some odd behavior
    // use spawnOptions to send things to `sudo` 
    options.env = process.env;
  }
  if (options.uid != null) {
    args.unshift(options.uid);
    args.unshift('-u');
    delete options.uid;
  }
  if (options.gid != null) {
    args.unshift(options.gid);
    args.unshift('-g');
    delete options.gid;
  }
  if (options.spawnOptions && options.spawnOptions.env) {
    options.env = options.spawnOptions.env;
  }
  return ['sudo', args, options];
}

