const extend = require('gextend');
const { spawn } = require('child_process');
const suspawn = require('suspawn');

function parse(out) {
  return function lineParser(line) {
    const chunks = line.split('\t');
    out.push({
      ip: chunks[0],
      mac: (chunks[1] || '').toUpperCase(),
      vendor: chunks[2]
    });
  };
}

const DEFAULTS = {
  command: 'arp-scan',
  args: ['-l', '--ignoredups', '--retry=7'],
  parser: parse,
  sudo: false
};

function scanner(cb, options) {
  options = extend({}, DEFAULTS, options);

  const out = [];
  let buffer = '';
  let errbuf = '';
  let arp = {};

  const parser = options.parser(out);

  if (options.interface) {
    options.args = options.args.concat(['--interface', options.interface]);
  }

  const cmd = `${options.command} ${options.args.join(' ')}`;

  if (options.verbose) console.log(options.sudo ? 'sudo ' : '' + cmd);

  if (options.sudo) {
    arp = suspawn(options.command, options.args);
  } else {
    arp = spawn(options.command, options.args);
  }

  arp.stdout.on('data', data => {
    buffer += data;
  });
  arp.stderr.on('data', data => {
    errbuf += data;
  });

  arp.on('close', code => {
    if (code != 0) return cb(code, null);

    buffer = buffer.split('\n');
    buffer = buffer.slice(2, -4);

    buffer.forEach(parser);

    cb(null, out);
  });

  arp.on('error', err => {
    cb(err, null);
  });

  arp.on('exit', (code, signal) => {});
}

module.exports = scanner;
module.exports.promisify = () => require('./arpscanner-promise');
