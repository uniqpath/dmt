import fs from 'fs';
import path from 'path';

import child_process from 'child_process';

class InvalidPathError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidPathError';
    Object.setPrototypeOf(this, InvalidPathError.prototype);
  }
}

class NoMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoMatchError';
    Object.setPrototypeOf(this, NoMatchError.prototype);
  }
}

function getFirstExistingParentPath(directoryPath, dependencies) {
  let parentDirectoryPath = directoryPath;
  let parentDirectoryFound = dependencies.fsExistsSync(parentDirectoryPath);
  while (!parentDirectoryFound) {
    parentDirectoryPath = dependencies.pathNormalize(parentDirectoryPath + '/..');
    parentDirectoryFound = dependencies.fsExistsSync(parentDirectoryPath);
  }
  return parentDirectoryPath;
}

export function checkDiskSpace(
  directoryPath,
  dependencies = {
    platform: process.platform,
    fsExistsSync: fs.existsSync,
    pathNormalize: path.normalize,
    pathSep: path.sep,
    cpExecFile: child_process.execFile
  }
) {
  function mapOutput(stdout, filter, mapping, coefficient) {
    const parsed = stdout
      .trim()
      .split('\n')
      .slice(1)
      .map(line => {
        return line.trim().split(/\s+(?=[\d/])/);
      });
    const filtered = parsed.filter(filter);
    if (filtered.length === 0) {
      throw new NoMatchError();
    }
    const diskData = filtered[0];
    return {
      diskPath: diskData[mapping.diskPath],
      free: parseInt(diskData[mapping.free], 10) * coefficient,
      size: parseInt(diskData[mapping.size], 10) * coefficient
    };
  }
  function check(cmd, filter, mapping, coefficient = 1) {
    return new Promise((resolve, reject) => {
      const [file, ...args] = cmd;
      if (file === undefined) {
        return Promise.reject('cmd must contain at least one item');
      }
      dependencies.cpExecFile(file, args, (error, stdout) => {
        if (error) {
          reject(error);
        }
        try {
          resolve(mapOutput(stdout, filter, mapping, coefficient));
        } catch (error2) {
          reject(error2);
        }
      });
    });
  }
  function checkWin32(directoryPath) {
    if (directoryPath.charAt(1) !== ':') {
      return new Promise((resolve, reject) => {
        reject(new InvalidPathError(`The following path is invalid (should be X:\\...): ${directoryPath}`));
      });
    }
    return check(
      ['wmic', 'logicaldisk', 'get', 'size,freespace,caption'],
      driveData => {
        const driveLetter = driveData[0];
        return directoryPath.toUpperCase().startsWith(driveLetter.toUpperCase());
      },
      {
        diskPath: 0,
        free: 1,
        size: 2
      }
    );
  }
  function checkUnix(directoryPath) {
    if (!dependencies.pathNormalize(directoryPath).startsWith(dependencies.pathSep)) {
      return new Promise((resolve, reject) => {
        reject(new InvalidPathError(`The following path is invalid (should start by ${dependencies.pathSep}): ${directoryPath}`));
      });
    }
    const pathToCheck = getFirstExistingParentPath(directoryPath, dependencies);
    return check(
      ['df', '-Pk', '--', pathToCheck],
      () => true,
      {
        diskPath: 5,
        free: 3,
        size: 1
      },
      1024
    );
  }
  if (dependencies.platform === 'win32') {
    return checkWin32(directoryPath);
  }
  return checkUnix(directoryPath);
}
