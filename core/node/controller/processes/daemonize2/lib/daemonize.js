import fs from 'fs';
import path from 'path';
import util from 'util';

import { spawn } from 'child_process';

import EventEmitter from 'events';

import * as constants from './constants';

export default function daemonize(options) {
  return new Daemon(options);
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Daemon = function(options) {
  EventEmitter.call(this);

  if (!options.main) throw new Error("Expected 'main' option for daemonize");

  const dir = path.dirname(options.filename);
  const main = path.resolve(dir, options.main);
  const name = options.name || path.basename(main, '.js');

  if (!this._isFile(main)) throw new Error("Can't find daemon main module: '" + main + "'");

  this._options = {};

  for (const arg in options) this._options[arg] = options[arg];

  this._options.main = main;
  this._options.name = this.name = name;

  this._options.pidfile = options.pidfile ? path.resolve(dir, options.pidfile) : path.join('/var/run', name + '.pid');

  this._options.user = options.user || '';
  this._options.group = options.group || '';

  if (typeof options.umask == 'undefined') this._options.umask = 0;
  else if (typeof options.umask == 'string') this._options.umask = parseInt(options.umask);

  this._options.args = this._makeArray(options.args);
  this._options.argv = this._makeArray(options.argv || process.argv.slice(2));

  this._stopTimeout = options.stopTimeout || 2000;

  this._childExitHandler = null;
  this._childDisconnectHandler = null;
  this._childDisconnectTimer = null;

  if (!options.silent) this._bindConsole();
};
util.inherits(Daemon, EventEmitter);

Daemon.prototype.start = function(listener) {
  let pid = this._sendSignal(this._getpid());

  if (pid) {
    this.emit('running', pid);
    if (listener) listener(null, pid);
    return this;
  }

  if (listener) {
    let errorFunc;
    let startedFunc;

    this.once(
      'error',
      (errorFunc = function(err) {
        this.removeListener('started', startedFunc);
        listener(err, 0);
      }.bind(this))
    );

    this.once(
      'started',
      (startedFunc = function(pid) {
        this.removeListener('error', errorFunc);
        listener(null, pid);
      }.bind(this))
    );
  }

  this.emit('starting');

  const err = this._savepid('');
  if (err) {
    this.emit('error', new Error('Failed to write pidfile (' + err + ')'));
    return this;
  }

  const cmd = [`${__dirname}/wrapper.js`];

  for (const flag of this._options.nodeFlags || []) {
    cmd.unshift(flag);
  }

  const child = spawn(process.execPath, (this._options.args || []).concat(cmd).concat(this._options.argv), {
    env: process.env,
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    detached: true
  });
  pid = child.pid;

  this._savepid(pid);

  child.on('message', msg => {
    if (msg.type == 'wrapper_loaded') {
      child.send({ type: 'init', options: this._options });
    }
    if (msg.type == 'error') throw new Error(msg.error);
  });

  child.once(
    'exit',
    (this._childExitHandler = function(code, signal) {
      child.removeListener('disconnect', this._childDisconnectHandler);
      clearTimeout(this._childDisconnectTimer);

      if (code > 0) {
        this.emit('error', new Error(code > 1 ? constants.findExitCode(code) : "Module '" + this._options.main + "' stopped unexpected"));
      } else {
        this.emit('stopped');
      }
    }.bind(this))
  );

  child.once(
    'disconnect',
    (this._childDisconnectHandler = function() {
      this._childDisconnectTimer = setTimeout(
        function() {
          child.removeListener('exit', this._childExitHandler);

          if (this._sendSignal(pid)) {
            this.emit('started', pid);
          } else {
            this.emit('error', new Error('Daemon failed to start'));
          }
        }.bind(this),
        100
      );
    }.bind(this))
  );

  child.unref();

  return this;
};

Daemon.prototype.stop = function(listener, signals, timeout) {
  return this._kill(signals || ['SIGTERM'], timeout || 0, listener);
};

Daemon.prototype.kill = function(listener, signals, timeout) {
  return this._kill(signals || ['SIGTERM', 'SIGKILL'], timeout || 0, listener);
};

Daemon.prototype.status = function() {
  return this._sendSignal(this._getpid());
};

Daemon.prototype.sendSignal = function(signal) {
  return this._sendSignal(this._getpid(), signal);
};

Daemon.prototype._makeArray = function(args) {
  if (typeof args == 'undefined') return [];
  return typeof args == 'string' ? args.split(/\s+/) : args;
};

Daemon.prototype._getpid = function() {
  try {
    return parseInt(fs.readFileSync(this._options.pidfile));
  } catch (err) {}

  return 0;
};

Daemon.prototype._savepid = function(pid) {
  try {
    fs.writeFileSync(this._options.pidfile, pid + '\n');
  } catch (ex) {
    return ex.code;
  }
  return '';
};

Daemon.prototype._sendSignal = function(pid, signal) {
  if (!pid) return 0;

  try {
    process.kill(pid, signal || 0);
    return pid;
  } catch (err) {}

  return 0;
};

Daemon.prototype._kill = function(signals, timeout, listener) {
  var pid = this._sendSignal(this._getpid());

  if (!pid) {
    this.emit('notrunning');
    if (listener) listener(null, 0);
    return this;
  }

  if (listener) {
    this.once('stopped', function(pid) {
      listener(null, pid);
    });
  }

  this.emit('stopping');

  this._tryKill(
    pid,
    signals,
    timeout,
    function(pid) {
      try {
        fs.unlinkSync(this._options.pidfile);
      } catch (ex) {}

      this.emit('stopped', pid);
    }.bind(this)
  );

  return this;
};

Daemon.prototype._tryKill = function(pid, signals, timeout, callback) {
  if (!this._sendSignal(pid, signals.length > 1 ? signals.shift() : signals[0])) {
    if (callback) callback(pid);
    return true;
  }

  setTimeout(this._tryKill.bind(this, pid, signals, timeout, callback), timeout || this._stopTimeout);
  return false;
};

Daemon.prototype._isFile = function(path) {
  try {
    const stat = fs.statSync(path);
    if (stat && !stat.isDirectory()) return true;
  } catch (err) {}

  return false;
};

Daemon.prototype._bindConsole = function() {
  this.on('starting', () => {
    console.log(`Starting ${this.name} daemon...`);
  })
    .on('started', pid => {
      console.log(`${this.name} daemon started. PID: ${pid}`);
    })
    .on('stopping', () => {
      console.log(`Stopping ${this.name} daemon...`);
    })
    .on('stopped', pid => {
      console.log(`${this.name} daemon stopped.`);
    })
    .on('running', pid => {
      console.log(`${this.name} daemon already running. PID: ${pid}`);
    })
    .on('notrunning', () => {
      console.log(`${this.name} daemon is not running`);
    })
    .on('error', err => {
      console.log(`${this.name} daemon failed to start: ${err.message}`);
    });
};
