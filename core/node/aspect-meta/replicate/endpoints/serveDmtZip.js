import colors from 'colors';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

import dmt from 'dmt/bridge';
const { scan, log, def, stopwatch } = dmt;

import { pipeline, Transform } from 'stream';
import { StringDecoder } from 'string_decoder';

class CodeTransform extends Transform {
  constructor(options) {
    super(options);

    this.textProcess = options.textProcess;

    this._decoder = new StringDecoder('utf-8');
  }

  _transform(chunk, encoding, callback) {
    if (encoding === 'buffer') {
      chunk = this._decoder.write(chunk);
    }

    if (this.textProcess) {
      chunk = this.textProcess(chunk);
    }

    callback(null, chunk);
  }
}

function replicateAllowed(entry) {
  return (
    entry.basename != '.DS_Store' &&
    entry.reldir != 'user' &&
    entry.reldir != 'state' &&
    entry.reldir != 'log' &&
    entry.relpath != 'todo.txt' &&
    entry.relpath != 'tagversion' &&
    entry.relpath != 'core/node/.gitignore' &&
    entry.relpath != 'core/node/connectome/.gitignore' &&
    entry.relpath != 'shell/.bash_staging' &&
    entry.relpath != 'etc/.bash_aliases_bundle' &&
    entry.relpath != 'etc/.bash_aliases_slim' &&
    !entry.path.includes('.git/') &&
    !entry.path.includes('target/debug') &&
    !entry.path.includes('target/release')
  );
}

function dmtFilesAndSymlinks({ replicateExcludedByUser }) {
  log.gray(`Building dmt source file list for the first ${colors.cyan('dmt.zip')} streaming request ...`);

  const start = stopwatch.start();

  const _replicateExcludedByUser = replicateExcludedByUser || (() => false);

  const pkgPath = dmt.dmtPath;

  const files = scan.recursive(pkgPath, {
    flatten: true,
    includeSymlinks: true,
    filter: entry => !_replicateExcludedByUser(entry) && replicateAllowed(entry)
  });

  log.green(`Finished reading dmt source file tree in ${colors.yellow(stopwatch.stop(start))}`);

  return files.filter(filterOutDevGui).filter(filterOutUnneededBin);
}

function filterOutUnneededBin(fileInfo) {
  if (fileInfo.relpath.startsWith('bin/')) {
    return fileInfo.basename.startsWith('walkdir') || fileInfo.basename.startsWith('walksearch');
  }

  return true;
}

function filterOutDevGui(fileInfo) {
  const viewDefsPath = path.join(dmt.dmtPath, 'def/gui_views.def');

  const wallpapers = [];
  const views = [];

  if (fs.existsSync(viewDefsPath)) {
    for (const viewDef of dmt.parseDef(viewDefsPath, { caching: false }).multi) {
      wallpapers.push(...def.values(viewDef.wallpaper));
      views.push(viewDef.id);
    }
  }

  if (fileInfo.relpath.includes('.common-deps-frontend')) {
    return false;
  }

  if (fileInfo.relpath.includes('gui-frontend-core')) {
    if (fileInfo.relpath.includes('gui-frontend-core/common_assets')) {
      if (fileInfo.relpath.includes('common_assets/wallpapers')) {
        return wallpapers.find(wp => fileInfo.relpath.endsWith(wp));
      }

      return true;
    }

    const passThrough = ['app'].concat(views);
    return passThrough.find(view => fileInfo.relpath.includes(`gui-frontend-core/${view}/public`));
  }

  return true;
}

function deliverDmtZip({ req, res, program, files, replicateExcludedByUser, replicateUserCodeTransform }) {
  if (files.length == 0) {
    files.push(...dmtFilesAndSymlinks({ replicateExcludedByUser }));
  }

  const start = stopwatch.start();

  log.gray(`Starting ${colors.cyan('dmt.zip')} streaming response ...`);

  const archive = archiver('zip');

  archive.on('error', err => {
    res.status(500).send({ error: err.message });
  });

  archive.on('end', () => {
    log.green(`Finished streaming ${colors.yellow(`${archive.pointer()} bytes`)} of ${colors.cyan('dmt.zip')} in ${colors.yellow(stopwatch.stop(start))}`);
    program.emit('replicate:finished', { host: req.headers.host });
  });

  res.attachment('dmt.zip');

  archive.pipe(res);

  for (const file of files) {
    if (replicateUserCodeTransform && ['.js', '.mjs'].includes(file.extname) && file.basename != 'bundle.js' && !file.path.includes('node_modules')) {
      const readable = fs.createReadStream(file.path);

      const _pipeline = pipeline(readable, new CodeTransform({ textProcess: replicateUserCodeTransform }), err => {
        if (err) {
          console.error('Pipeline failed.', err);
        }
      });

      archive.append(_pipeline, { name: file.relpath });
    } else {
      archive.file(file.path, { name: file.relpath });
    }
  }

  archive.finalize();
}

export default deliverDmtZip;
