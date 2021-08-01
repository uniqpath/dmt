import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { access, accessSync } = fs;
const constants = fs.constants || fs;

const isUsingWindows = process.platform == 'win32';

const fileNotExists = function(commandName, callback) {
  access(commandName, constants.F_OK, function(err) {
    callback(!err);
  });
};

const fileNotExistsSync = function(commandName) {
  try {
    accessSync(commandName, constants.F_OK);
    return false;
  } catch (e) {
    return true;
  }
};

const localExecutable = function(commandName, callback) {
  access(commandName, constants.F_OK | constants.X_OK, function(err) {
    callback(null, !err);
  });
};

const localExecutableSync = function(commandName) {
  try {
    accessSync(commandName, constants.F_OK | constants.X_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const commandExistsUnix = function(commandName, cleanedCommandName, callback) {
  fileNotExists(commandName, function(isFile) {
    if (!isFile) {
      const child = exec('command -v ' + cleanedCommandName + ' 2>/dev/null' + ' && { echo >&1 ' + cleanedCommandName + '; exit 0; }', function(
        error,
        stdout,
        stderr
      ) {
        callback(null, !!stdout);
      });
      return;
    }

    localExecutable(commandName, callback);
  });
};

const commandExistsWindows = function(commandName, cleanedCommandName, callback) {
  if (/[\x00-\x1f<>:"\|\?\*]/.test(commandName)) {
    callback(null, false);
    return;
  }
  const child = exec('where ' + cleanedCommandName, function(error) {
    if (error !== null) {
      callback(null, false);
    } else {
      callback(null, true);
    }
  });
};

const commandExistsUnixSync = function(commandName, cleanedCommandName) {
  if (fileNotExistsSync(commandName)) {
    try {
      const stdout = execSync('command -v ' + cleanedCommandName + ' 2>/dev/null' + ' && { echo >&1 ' + cleanedCommandName + '; exit 0; }');
      return !!stdout;
    } catch (error) {
      return false;
    }
  }
  return localExecutableSync(commandName);
};

const commandExistsWindowsSync = function(commandName, cleanedCommandName, callback) {
  if (/[\x00-\x1f<>:"\|\?\*]/.test(commandName)) {
    return false;
  }
  try {
    const stdout = execSync('where ' + cleanedCommandName, { stdio: [] });
    return !!stdout;
  } catch (error) {
    return false;
  }
};

const cleanInput = function(s) {
  if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
    s = "'" + s.replace(/'/g, "'\\''") + "'";
    s = s.replace(/^(?:'')+/g, '').replace(/\\'''/g, "\\'");
  }
  return s;
};

if (isUsingWindows) {
  cleanInput = function(s) {
    const isPathName = /[\\]/.test(s);
    if (isPathName) {
      const dirname = '"' + path.dirname(s) + '"';
      const basename = '"' + path.basename(s) + '"';
      return dirname + ':' + basename;
    }
    return '"' + s + '"';
  };
}

function commandExists(commandName, callback) {
  const cleanedCommandName = cleanInput(commandName);
  if (!callback && typeof Promise !== 'undefined') {
    return new Promise(function(resolve, reject) {
      commandExists(commandName, function(error, output) {
        if (output) {
          resolve(commandName);
        } else {
          reject(error);
        }
      });
    });
  }
  if (isUsingWindows) {
    commandExistsWindows(commandName, cleanedCommandName, callback);
  } else {
    commandExistsUnix(commandName, cleanedCommandName, callback);
  }
}

function commandExistsSync(commandName) {
  const cleanedCommandName = cleanInput(commandName);
  if (isUsingWindows) {
    return commandExistsWindowsSync(commandName, cleanedCommandName);
  } else {
    return commandExistsUnixSync(commandName, cleanedCommandName);
  }
}

export { commandExists, commandExistsSync };
