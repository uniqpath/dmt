import path from 'path';
import util from 'util';
import fs from 'fs';
import fse from 'fs-extra';
import { homedir } from 'os';

import { commandExists, commandExistsSync } from './utilities/command-exists/command-exists';

function ensureDirSync(directory) {
  const options = {
    mode: 0o2775
  };
  fse.ensureDir(directory, options);
}

function flattenTree(tree) {
  const files = [];

  for (const entry of tree) {
    if (entry.isFile || entry.isSymlink) {
      files.push(entry);
    }

    if (entry.isDirectory) {
      files.push(flattenTree(entry.contents));
    }
  }

  return files.flat();
}

function absolutizePath(path) {
  return path.replace(/^~/, homedir());
}

function relativizePath(path) {
  return path.replace(new RegExp(`^${homedir()}`), '~');
}

function recursive(_path, { flatten = false, filter = () => true, extname = null, includeSymlinks = false } = {}, scanpathRecursionState = null) {
  const fullPath = absolutizePath(_path);

  const list = fs.readdirSync(fullPath).map(relPath => `${fullPath}/${relPath}`);

  scanpathRecursionState = scanpathRecursionState || fullPath;

  const result = list
    .map(fileOrDir => {
      const info = {
        reldir: path.relative(scanpathRecursionState, path.dirname(fileOrDir)),
        relpath: path.join(path.relative(scanpathRecursionState, path.dirname(fileOrDir)), path.basename(fileOrDir)),
        dirname: path.dirname(fileOrDir),
        basename: path.basename(fileOrDir)
      };

      if (fs.existsSync(fileOrDir)) {
        if (fs.lstatSync(fileOrDir).isFile()) {
          info.extname = path.extname(fileOrDir);

          return Object.assign(
            {
              isFile: true,
              path: fileOrDir
            },
            info
          );
        }

        if (fs.lstatSync(fileOrDir).isDirectory()) {
          return Object.assign(
            {
              isDirectory: true,
              path: fileOrDir
            },
            Object.assign(info, { contents: recursive(fileOrDir, { filter, includeSymlinks }, scanpathRecursionState) })
          );
        }

        if (includeSymlinks && fs.lstatSync(fileOrDir).isSymbolicLink()) {
          info.extname = path.extname(fileOrDir);

          return Object.assign(
            {
              isSymlink: true,
              path: fileOrDir
            },
            info
          );
        }
      }

      return null;
    })
    .filter(Boolean);

  const filteredResults = flatten ? flattenTree(result).filter(filter) : result.filter(filter);

  if (extname) {
    return filteredResults.filter(entry => entry.isDirectory || (entry.isFile && entry.extname == extname));
  }

  return filteredResults.filter(({ basename }) => basename != '.DS_Store');
}

function dir(_path, { onlyFiles = false, onlyDirs = false, onlySymlinks = false } = {}) {
  const fullPath = absolutizePath(_path);

  const list = fs.readdirSync(fullPath).map(relPath => `${fullPath}/${relPath}`);

  if (onlyFiles) {
    return list.filter(fileOrDir => fs.lstatSync(fileOrDir).isFile());
  }

  if (onlyDirs) {
    return list.filter(fileOrDir => fs.lstatSync(fileOrDir).isDirectory());
  }

  if (onlySymlinks) {
    return list.filter(fileOrDir => fs.lstatSync(fileOrDir).isSymbolicLink());
  }

  return list;
}

const fileRead = util.promisify(fs.readFile);

function readFiles(files) {
  return Promise.all(
    files.map(({ path }) => {
      return new Promise(success => {
        fileRead(path)
          .then(fileBuffer => success({ filePath: path, fileBuffer }))
          .catch(e => success({ error: e.message }));
      });
    })
  );
}

function readFileLines(filePath) {
  return fs
    .readFileSync(filePath)
    .toString()
    .split('\r')
    .join('')
    .split('\n');
}

function cleanEmptyDirsRecursively(folder) {
  const isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  let files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = path.join(folder, file);
      cleanEmptyDirsRecursively(fullPath);
    });

    files = fs.readdirSync(folder);
  }

  if (files.length == 0) {
    fs.rmdirSync(folder);
  }
}

function syncDir({ fromDir, toDir, fileExtension }) {
  ensureDirSync(toDir);

  const files = recursive(fromDir, { flatten: true });

  for (const file of files.filter(file => (fileExtension ? file.extname == fileExtension : true))) {
    const targetDir = path.join(toDir, file.reldir);
    ensureDirSync(targetDir);
    fse.copySync(file.path, path.join(targetDir, file.basename));
  }

  const targetFiles = recursive(toDir, { flatten: true });

  for (const file of targetFiles) {
    const fileOnSource = path.resolve(fromDir, file.reldir, file.basename);
    if (!fs.existsSync(fileOnSource)) {
      fs.unlinkSync(file.path);
    }
  }

  cleanEmptyDirsRecursively(toDir);
}

function mediaFilter({ mediaType }) {
  if (mediaType == 'image') {
    return ({ extname = null } = {}) => {
      return extname ? ['.jpg', '.png', '.gif', '.tiff'].includes(extname.toLowerCase()) : false;
    };
  }
}

export default {
  dir,
  recursive,
  flattenTree,
  syncDir,
  readFiles,
  readFileLines,
  ensureDirSync,
  mediaFilter,
  absolutizePath,
  relativizePath,
  commandExists,
  commandExistsSync
};
