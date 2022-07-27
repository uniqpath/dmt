import EventEmitter from 'events';

import connectModule from './_connect.js';
import commandModule from './_commands.js';
import controlModule from './_controls.js';
import eventModule from './_events.js';
import informationModule from './_information.js';
import playlistModule from './_playlist.js';

import util from '../util.js';
import ErrorHandler from '../error.js';

function mpv(options, mpv_args) {
  EventEmitter.call(this);

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
  EventEmitter.prototype
);

function load(file, mode = 'replace', options) {
  return new Promise((resolve, reject) => {
    this.socket
      .command('loadfile', options ? [file, mode].concat(util.formatOptions(options)) : [file, mode])
      .then(resolve)
      .catch(reject);
  });
}

export default mpv;
