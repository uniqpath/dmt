const path = require('path');
const notifier = path.resolve(__dirname, '../vendor/snoreToast/snoretoast');
const utils = require('../lib/utils');
const Balloon = require('./balloon');
const os = require('os');
const { v4: uuid } = require('uuid');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

let fallback;

const PIPE_NAME = 'notifierPipe';
const PIPE_PATH_PREFIX = '\\\\.\\pipe\\';
const PIPE_PATH_PREFIX_WSL = '/tmp/';

module.exports = WindowsToaster;

function WindowsToaster(options) {
  options = utils.clone(options || {});
  if (!(this instanceof WindowsToaster)) {
    return new WindowsToaster(options);
  }

  this.options = options;

  EventEmitter.call(this);
}
util.inherits(WindowsToaster, EventEmitter);

function noop() {}

function parseResult(data) {
  if (!data) {
    return {};
  }
  return data.split(';').reduce((acc, cur) => {
    const split = cur.split('=');
    if (split && split.length === 2) {
      acc[split[0]] = split[1];
    }
    return acc;
  }, {});
}

function getPipeName() {
  const pathPrefix = utils.isWSL() ? PIPE_PATH_PREFIX_WSL : PIPE_PATH_PREFIX;
  return `${pathPrefix}${PIPE_NAME}-${uuid()}`;
}

function notifyRaw(options, callback) {
  options = utils.clone(options || {});
  callback = callback || noop;
  const is64Bit = os.arch() === 'x64';
  let resultBuffer;
  const server = {
    namedPipe: getPipeName()
  };

  if (typeof options === 'string') {
    options = { title: 'node-notifier', message: options };
  }

  if (typeof callback !== 'function') {
    throw new TypeError('The second argument must be a function callback. You have passed ' + typeof fn);
  }

  const snoreToastResultParser = (err, callback) => {
    const result = parseResult(resultBuffer && resultBuffer.toString('utf16le'));

    if (result.action === 'buttonClicked' && result.button) {
      result.activationType = result.button;
    } else if (result.action) {
      result.activationType = result.action;
    }

    if (err && err.code === -1) {
      callback(err, result);
    }
    callback(null, result);

    server.instance && server.instance.close();
  };

  const actionJackedCallback = err =>
    snoreToastResultParser(
      err,
      utils.actionJackerDecorator(this, options, callback, data => (data === 'activate' ? 'click' : data || false))
    );

  options.title = options.title || 'Node Notification:';
  if (typeof options.message === 'undefined' && typeof options.close === 'undefined') {
    callback(new Error('Message or ID to close is required.'));
    return this;
  }

  if (!utils.isWin8() && !utils.isWSL() && !!this.options.withFallback) {
    fallback = fallback || new Balloon(this.options);
    return fallback.notify(options, callback);
  }

  utils.createNamedPipe(server).then(out => {
    resultBuffer = out;
    options.pipeName = server.namedPipe;

    const localNotifier = options.customPath || this.options.customPath || notifier + '-x' + (is64Bit ? '64' : '86') + '.exe';

    options = utils.mapToWin8(options);
    const argsList = utils.constructArgumentList(options, {
      explicitTrue: true,
      wrapper: '',
      keepNewlines: true,
      noEscape: true
    });

    utils.fileCommand(localNotifier, argsList, actionJackedCallback);
  });
  return this;
}

Object.defineProperty(WindowsToaster.prototype, 'notify', {
  get: function() {
    if (!this._notify) this._notify = notifyRaw.bind(this);
    return this._notify;
  }
});
