const eventEmitter = require('events').EventEmitter;

const connectModule = require('./_connect');
const commandModule = require('./_commands');
const controlModule = require('./_controls');
const eventModule = require('./_events');
const informationModule = require('./_information');
const playlistModule = require('./_playlist');

const util = require('../util');
const ErrorHandler = require('../error');

function mpv(options, mpv_args) {
  eventEmitter.call(this);

  this.options = util.mergeDefaultOptions(options);

  this.mpv_arguments = util.mpvArguments(this.options, mpv_args);

  this.observed = util.observedProperties(this.options.audio_only);

  this.observedIDs = {};

  this.currentTimePos = null;

  this.running = false;

  this.errorHandler = new ErrorHandler();
}

mpv.prototype = Object.assign(
  {
    constructor: mpv,
    load
  },
  controlModule,
  commandModule,
  eventModule,
  informationModule,
  playlistModule,
  connectModule,
  eventEmitter.prototype
);

function load(file, mode = 'replace', options) {
  return new Promise((resolve, reject) => {
    this.socket
      .command('loadfile', options ? [file, mode].concat(util.formatOptions(options)) : [file, mode])
      .then(resolve)
      .catch(reject);
  });
}

module.exports = mpv;
