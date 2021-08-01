import fs from 'fs';
import { exec } from 'child_process';

export { quotePath, isMounted, mount, umount };

function quotePath(path) {
  const pieces = path.split("'");
  const n = pieces.length;

  let output = '';
  for (let i = 0; i < n; i++) {
    output = `${output}'${pieces[i]}'`;
    if (i < n - 1) output = `${output}\\'`;
  }

  return output;
}

function isMounted(path, isDevice) {
  if (!isDevice && !fs.existsSync(path)) {
    return { mounted: false, error: 'Path does not exist' };
  }
  if (!fs.existsSync('/etc/mtab')) {
    return { mounted: false, error: "Can't read mtab" };
  }

  const mtab = fs.readFileSync('/etc/mtab', { encoding: 'ascii' }).split('\n');
  for (const line of mtab) {
    const mountDetail = line.split(' ');

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
}

function mount(dev, path, options, callback) {
  const mountInfo = this.isMounted(path, false);
  if (mountInfo.mounted) {
    callback({ error: 'Something is already mounted on ' + path });
    return;
  }

  if (!fs.existsSync(path)) {
    if (options.createDir) {
      let mode = '0777';
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

  const qdev = this.quotePath(dev);
  const qpath = this.quotePath(path);
  const cmd =
    (options.noSudo ? '' : (options.sudoPath ? options.sudoPath : '/usr/bin/sudo') + ' ') +
    (options.mountPath ? options.mountPath : '/bin/mount') +
    ' ' +
    (options.readonly ? '-r ' : '') +
    (options.fstype ? '-t ' + options.fstype + ' ' : '') +
    (options.fsopts ? '-o ' + options.fsopts + ' ' : '') +
    qdev +
    ' ' +
    qpath;

  const mountProc = exec(cmd, (error, stdout, stderr) => {
    if (error !== null) {
      callback({ error: 'exec error ' + error });
    } else {
      callback({ OK: true });
    }
  });
}

function umount(path, isDevice, options, callback) {
  const mountInfo = this.isMounted(path, isDevice);
  if (!mountInfo.mounted) {
    callback({ OK: true });
    return;
  }

  const qpath = this.quotePath(path);
  const cmd =
    (options.noSudo ? '' : (options.sudoPath ? options.sudoPath : '/usr/bin/sudo') + ' ') +
    (options.umountPath ? options.umountPath : '/bin/umount') +
    ' ' +
    qpath;

  const umountProc = exec(cmd, (error, stdout, stderr) => {
    if (error !== null) {
      callback({ error: 'exec error ' + error });
    } else {
      if (options.removeDir) {
        fs.rmdirSync(mountInfo.mountpoint);
      }
      callback({ OK: true });
    }
  });
}
