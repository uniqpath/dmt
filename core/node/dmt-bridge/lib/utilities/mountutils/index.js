var fs = require('fs');
var exec = require('child_process').exec;
exports.quotePath = function(path) {
  var pieces = path.split("'");
  var output = '';
  var n = pieces.length;
  for (var i = 0; i < n; i++) {
    output = output + "'" + pieces[i] + "'";
    if (i < n - 1) output = output + "\\'";
  }
  return output;
};

exports.isMounted = function(path, isDevice) {
  if (!isDevice && !fs.existsSync(path)) {
    return { mounted: false, error: 'Path does not exist' };
  }
  if (!fs.existsSync('/etc/mtab')) {
    return { mounted: false, error: "Can't read mtab" };
  }

  var mtab = fs.readFileSync('/etc/mtab', { encoding: 'ascii' }).split('\n');
  for (const line of mtab) {
    var mountDetail = line.split(' ');

    if ((isDevice && mountDetail[0] == path) || (!isDevice && mountDetail[1] == path)) {
      return {
        mounted: true,
        device: mountDetail[0],
        mountpoint: mountDetail[1],
        fstype: mountDetail[2],
        fsopts: mountDetail[3]
      };
    }
  }
  return { mounted: false };
};

exports.mount = function(dev, path, options, callback) {
  var mountInfo = this.isMounted(path, false);
  if (mountInfo.mounted) {
    callback({ error: 'Something is already mounted on ' + path });
    return;
  }

  if (!fs.existsSync(path)) {
    if (options.createDir) {
      var mode = '0777';
      if (options.dirMode) {
        mode = options.dirMode;
      }
      fs.mkdirSync(path, mode);
    } else {
      callback({ error: 'Mount directory does not exist' });
      return;
    }
  }
  if (!fs.statSync(path).isDirectory()) {
    callback({ error: 'Mountpoint is not a directory' });
    return;
  }

  var qdev = this.quotePath(dev);
  var qpath = this.quotePath(path);
  var cmd =
    (options.noSudo ? '' : (options.sudoPath ? options.sudoPath : '/usr/bin/sudo') + ' ') +
    (options.mountPath ? options.mountPath : '/bin/mount') +
    ' ' +
    (options.readonly ? '-r ' : '') +
    (options.fstype ? '-t ' + options.fstype + ' ' : '') +
    (options.fsopts ? '-o ' + options.fsopts + ' ' : '') +
    qdev +
    ' ' +
    qpath;

  var mountProc = exec(cmd, function(error, stdout, stderr) {
    if (error !== null) {
      callback({ error: 'exec error ' + error });
    } else {
      callback({ OK: true });
    }
  });
};

exports.umount = function(path, isDevice, options, callback) {
  var mountInfo = this.isMounted(path, isDevice);
  if (!mountInfo.mounted) {
    callback({ OK: true });
    return;
  }

  var qpath = this.quotePath(path);
  var cmd =
    (options.noSudo ? '' : (options.sudoPath ? options.sudoPath : '/usr/bin/sudo') + ' ') +
    (options.umountPath ? options.umountPath : '/bin/umount') +
    ' ' +
    qpath;

  var umountProc = exec(cmd, function(error, stdout, stderr) {
    if (error !== null) {
      callback({ error: 'exec error ' + error });
    } else {
      if (options.removeDir) {
        fs.rmdirSync(mountInfo.mountpoint);
      }
      callback({ OK: true });
    }
  });
};
