import fs from 'fs';
import require$$0 from 'assert';
import require$$2 from 'events';
import path from 'path';
import require$$0$1 from 'util';
import require$$1 from 'worker_threads';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

var commonjsGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {};

function createCommonjsModule(fn, basedir, module) {
  return (
    (module = {
      path: basedir,
      exports: {},
      require: function(path, base) {
        return commonjsRequire(path, base === undefined || base === null ? module.path : base);
      }
    }),
    fn(module, module.exports),
    module.exports
  );
}

function commonjsRequire() {
  throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var imurmurhash = createCommonjsModule(function(module) {
  (function() {
    var cache;

    function MurmurHash3(key, seed) {
      var m = this instanceof MurmurHash3 ? this : cache;
      m.reset(seed);
      if (typeof key === 'string' && key.length > 0) {
        m.hash(key);
      }

      if (m !== this) {
        return m;
      }
    }
    MurmurHash3.prototype.hash = function(key) {
      var h1, k1, i, top, len;

      len = key.length;
      this.len += len;

      k1 = this.k1;
      i = 0;
      switch (this.rem) {
        case 0:
          k1 ^= len > i ? key.charCodeAt(i++) & 0xffff : 0;
        case 1:
          k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 8 : 0;
        case 2:
          k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 16 : 0;
        case 3:
          k1 ^= len > i ? (key.charCodeAt(i) & 0xff) << 24 : 0;
          k1 ^= len > i ? (key.charCodeAt(i++) & 0xff00) >> 8 : 0;
      }

      this.rem = (len + this.rem) & 3;
      len -= this.rem;
      if (len > 0) {
        h1 = this.h1;
        while (1) {
          k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
          k1 = (k1 << 15) | (k1 >>> 17);
          k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;

          h1 ^= k1;
          h1 = (h1 << 13) | (h1 >>> 19);
          h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff;

          if (i >= len) {
            break;
          }

          k1 = (key.charCodeAt(i++) & 0xffff) ^ ((key.charCodeAt(i++) & 0xffff) << 8) ^ ((key.charCodeAt(i++) & 0xffff) << 16);
          top = key.charCodeAt(i++);
          k1 ^= ((top & 0xff) << 24) ^ ((top & 0xff00) >> 8);
        }

        k1 = 0;
        switch (this.rem) {
          case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xffff) << 16;
          case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xffff) << 8;
          case 1:
            k1 ^= key.charCodeAt(i) & 0xffff;
        }

        this.h1 = h1;
      }

      this.k1 = k1;
      return this;
    };

    MurmurHash3.prototype.result = function() {
      var k1, h1;

      k1 = this.k1;
      h1 = this.h1;

      if (k1 > 0) {
        k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;
        h1 ^= k1;
      }

      h1 ^= this.len;

      h1 ^= h1 >>> 16;
      h1 = (h1 * 0xca6b + (h1 & 0xffff) * 0x85eb0000) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = (h1 * 0xae35 + (h1 & 0xffff) * 0xc2b20000) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    };

    MurmurHash3.prototype.reset = function(seed) {
      this.h1 = typeof seed === 'number' ? seed : 0;
      this.rem = this.k1 = this.len = 0;
      return this;
    };

    cache = new MurmurHash3();

    {
      module.exports = MurmurHash3;
    }
  })();
});

var signals = createCommonjsModule(function(module) {
  module.exports = ['SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGTERM'];

  if (process.platform !== 'win32') {
    module.exports.push('SIGVTALRM', 'SIGXCPU', 'SIGXFSZ', 'SIGUSR2', 'SIGTRAP', 'SIGSYS', 'SIGQUIT', 'SIGIOT');
  }

  if (process.platform === 'linux') {
    module.exports.push('SIGIO', 'SIGPOLL', 'SIGPWR', 'SIGSTKFLT', 'SIGUNUSED');
  }
});

var signalExit = createCommonjsModule(function(module) {
  var process = commonjsGlobal.process;

  const processOk = function(process) {
    return (
      process &&
      typeof process === 'object' &&
      typeof process.removeListener === 'function' &&
      typeof process.emit === 'function' &&
      typeof process.reallyExit === 'function' &&
      typeof process.listeners === 'function' &&
      typeof process.kill === 'function' &&
      typeof process.pid === 'number' &&
      typeof process.on === 'function'
    );
  };

  if (!processOk(process)) {
    module.exports = function() {
      return function() {};
    };
  } else {
    var assert = require$$0;
    var signals$1 = signals;
    var isWin = /^win/i.test(process.platform);

    var EE = require$$2;
    if (typeof EE !== 'function') {
      EE = EE.EventEmitter;
    }

    var emitter;
    if (process.__signal_exit_emitter__) {
      emitter = process.__signal_exit_emitter__;
    } else {
      emitter = process.__signal_exit_emitter__ = new EE();
      emitter.count = 0;
      emitter.emitted = {};
    }

    if (!emitter.infinite) {
      emitter.setMaxListeners(Infinity);
      emitter.infinite = true;
    }

    module.exports = function(cb, opts) {
      if (!processOk(commonjsGlobal.process)) {
        return function() {};
      }
      assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

      if (loaded === false) {
        load();
      }

      var ev = 'exit';
      if (opts && opts.alwaysLast) {
        ev = 'afterexit';
      }

      var remove = function() {
        emitter.removeListener(ev, cb);
        if (emitter.listeners('exit').length === 0 && emitter.listeners('afterexit').length === 0) {
          unload();
        }
      };
      emitter.on(ev, cb);

      return remove;
    };

    var unload = function unload() {
      if (!loaded || !processOk(commonjsGlobal.process)) {
        return;
      }
      loaded = false;

      signals$1.forEach(function(sig) {
        try {
          process.removeListener(sig, sigListeners[sig]);
        } catch (er) {}
      });
      process.emit = originalProcessEmit;
      process.reallyExit = originalProcessReallyExit;
      emitter.count -= 1;
    };
    module.exports.unload = unload;

    var emit = function emit(event, code, signal) {
      if (emitter.emitted[event]) {
        return;
      }
      emitter.emitted[event] = true;
      emitter.emit(event, code, signal);
    };

    var sigListeners = {};
    signals$1.forEach(function(sig) {
      sigListeners[sig] = function listener() {
        if (!processOk(commonjsGlobal.process)) {
          return;
        }
        var listeners = process.listeners(sig);
        if (listeners.length === emitter.count) {
          unload();
          emit('exit', null, sig);
          emit('afterexit', null, sig);
          if (isWin && sig === 'SIGHUP') {
            sig = 'SIGINT';
          }
          process.kill(process.pid, sig);
        }
      };
    });

    module.exports.signals = function() {
      return signals$1;
    };

    var loaded = false;

    var load = function load() {
      if (loaded || !processOk(commonjsGlobal.process)) {
        return;
      }
      loaded = true;

      emitter.count += 1;

      signals$1 = signals$1.filter(function(sig) {
        try {
          process.on(sig, sigListeners[sig]);
          return true;
        } catch (er) {
          return false;
        }
      });

      process.emit = processEmit;
      process.reallyExit = processReallyExit;
    };
    module.exports.load = load;

    var originalProcessReallyExit = process.reallyExit;
    var processReallyExit = function processReallyExit(code) {
      if (!processOk(commonjsGlobal.process)) {
        return;
      }
      process.exitCode = code || 0;
      emit('exit', process.exitCode, null);
      emit('afterexit', process.exitCode, null);
      originalProcessReallyExit.call(process, process.exitCode);
    };

    var originalProcessEmit = process.emit;
    var processEmit = function processEmit(ev, arg) {
      if (ev === 'exit' && processOk(commonjsGlobal.process)) {
        if (arg !== undefined) {
          process.exitCode = arg;
        }
        var ret = originalProcessEmit.apply(this, arguments);
        emit('exit', process.exitCode, null);
        emit('afterexit', process.exitCode, null);
        return ret;
      } else {
        return originalProcessEmit.apply(this, arguments);
      }
    };
  }
});

var lib = writeFile;
var sync = writeFileSync;
var _getTmpname = getTmpname;
var _cleanupOnExit = cleanupOnExit;

const { promisify } = require$$0$1;
const activeFiles = {};

const threadId = (function getId() {
  try {
    const workerThreads = require$$1;

    return workerThreads.threadId;
  } catch (e) {
    return 0;
  }
})();

let invocations = 0;
function getTmpname(filename) {
  return (
    filename +
    '.' +
    imurmurhash(__filename)
      .hash(String(process.pid))
      .hash(String(threadId))
      .hash(String(++invocations))
      .result()
  );
}

function cleanupOnExit(tmpfile) {
  return () => {
    try {
      fs.unlinkSync(typeof tmpfile === 'function' ? tmpfile() : tmpfile);
    } catch (_) {}
  };
}

function serializeActiveFile(absoluteName) {
  return new Promise(resolve => {
    if (!activeFiles[absoluteName]) {
      activeFiles[absoluteName] = [];
    }

    activeFiles[absoluteName].push(resolve);
    if (activeFiles[absoluteName].length === 1) {
      resolve();
    }
  });
}

function isChownErrOk(err) {
  if (err.code === 'ENOSYS') {
    return true;
  }

  const nonroot = !process.getuid || process.getuid() !== 0;
  if (nonroot) {
    if (err.code === 'EINVAL' || err.code === 'EPERM') {
      return true;
    }
  }

  return false;
}

async function writeFileAsync(filename, data, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  let fd;
  let tmpfile;
  const removeOnExitHandler = signalExit(cleanupOnExit(() => tmpfile));
  const absoluteName = path.resolve(filename);

  try {
    await serializeActiveFile(absoluteName);
    const truename = await promisify(fs.realpath)(filename).catch(() => filename);
    tmpfile = getTmpname(truename);

    if (!options.mode || !options.chown) {
      const stats = await promisify(fs.stat)(truename).catch(() => {});
      if (stats) {
        if (options.mode == null) {
          options.mode = stats.mode;
        }

        if (options.chown == null && process.getuid) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
      }
    }

    fd = await promisify(fs.open)(tmpfile, 'w', options.mode);
    if (options.tmpfileCreated) {
      await options.tmpfileCreated(tmpfile);
    }
    if (ArrayBuffer.isView(data)) {
      await promisify(fs.write)(fd, data, 0, data.length, 0);
    } else if (data != null) {
      await promisify(fs.write)(fd, String(data), 0, String(options.encoding || 'utf8'));
    }

    if (options.fsync !== false) {
      await promisify(fs.fsync)(fd);
    }

    await promisify(fs.close)(fd);
    fd = null;

    if (options.chown) {
      await promisify(fs.chown)(tmpfile, options.chown.uid, options.chown.gid).catch(err => {
        if (!isChownErrOk(err)) {
          throw err;
        }
      });
    }

    if (options.mode) {
      await promisify(fs.chmod)(tmpfile, options.mode).catch(err => {
        if (!isChownErrOk(err)) {
          throw err;
        }
      });
    }

    await promisify(fs.rename)(tmpfile, truename);
  } finally {
    if (fd) {
      await promisify(fs.close)(fd).catch(() => {});
    }
    removeOnExitHandler();
    await promisify(fs.unlink)(tmpfile).catch(() => {});
    activeFiles[absoluteName].shift();
    if (activeFiles[absoluteName].length > 0) {
      activeFiles[absoluteName][0]();
    } else {
      delete activeFiles[absoluteName];
    }
  }
}

function writeFile(filename, data, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  const promise = writeFileAsync(filename, data, options);
  if (callback) {
    promise.then(callback, callback);
  }

  return promise;
}

function writeFileSync(filename, data, options) {
  if (typeof options === 'string') {
    options = { encoding: options };
  } else if (!options) {
    options = {};
  }
  try {
    filename = fs.realpathSync(filename);
  } catch (ex) {}
  const tmpfile = getTmpname(filename);

  if (!options.mode || !options.chown) {
    try {
      const stats = fs.statSync(filename);
      options = Object.assign({}, options);
      if (!options.mode) {
        options.mode = stats.mode;
      }
      if (!options.chown && process.getuid) {
        options.chown = { uid: stats.uid, gid: stats.gid };
      }
    } catch (ex) {}
  }

  let fd;
  const cleanup = cleanupOnExit(tmpfile);
  const removeOnExitHandler = signalExit(cleanup);

  let threw = true;
  try {
    fd = fs.openSync(tmpfile, 'w', options.mode || 0o666);
    if (options.tmpfileCreated) {
      options.tmpfileCreated(tmpfile);
    }
    if (ArrayBuffer.isView(data)) {
      fs.writeSync(fd, data, 0, data.length, 0);
    } else if (data != null) {
      fs.writeSync(fd, String(data), 0, String(options.encoding || 'utf8'));
    }
    if (options.fsync !== false) {
      fs.fsyncSync(fd);
    }

    fs.closeSync(fd);
    fd = null;

    if (options.chown) {
      try {
        fs.chownSync(tmpfile, options.chown.uid, options.chown.gid);
      } catch (err) {
        if (!isChownErrOk(err)) {
          throw err;
        }
      }
    }

    if (options.mode) {
      try {
        fs.chmodSync(tmpfile, options.mode);
      } catch (err) {
        if (!isChownErrOk(err)) {
          throw err;
        }
      }
    }

    fs.renameSync(tmpfile, filename);
    threw = false;
  } finally {
    if (fd) {
      try {
        fs.closeSync(fd);
      } catch (ex) {}
    }
    removeOnExitHandler();
    if (threw) {
      cleanup();
    }
  }
}
lib.sync = sync;
lib._getTmpname = _getTmpname;
lib._cleanupOnExit = _cleanupOnExit;

export default lib;
