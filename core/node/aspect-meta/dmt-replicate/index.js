const colors = require('colors');
const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const dmt = require('dmt-bridge');
const { scan, log, def, stopwatch, util } = dmt;

const { pipeline, Transform } = require('stream');
const { StringDecoder } = require('string_decoder');

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
    entry.reldir != 'user' &&
    entry.reldir != 'state' &&
    entry.reldir != 'log' &&
    entry.reldir != 'playground' &&
    entry.reldir != 'core/node/playground' &&
    entry.relpath != 'todo.txt' &&
    entry.relpath != 'tagversion' &&
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

function install({ req, res, isCurl, program }) {
  const { host } = req.headers;
  const { protocol } = req;

  const bashScript = fs
    .readFileSync(path.join(__dirname, 'templates/install_from'))
    .toString()
    .replace(new RegExp('{{protocol}}', 'g'), protocol)
    .replace(new RegExp('{{host}}', 'g'), host);

  if (isCurl) {
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.send(bashScript);
  } else {
    const EOL = bashScript.match(/\r\n/gm) ? '\r\n' : '\n';

    const keywords = ['function', 'if', 'fi', 'then', 'else', 'eval', 'local', 'return', 'echo', 'printf', 'exit'];

    const commands = ['unzip', 'mv', 'cd', 'rm', 'mkdir', 'pwd'];

    const content = bashScript
      .split(EOL)
      .map(line => {
        if (line.trim().startsWith('#!/bin/bash')) {
          return `<span class="shebang">${line}</span>`;
        }

        if (line.trim().startsWith('# RPi')) {
          return `<span class="comment">#</span><span class="green">${line.replace('#', '')}</span>`;
        }

        if (line.trim().startsWith('# curl')) {
          return `<span class="comment">#</span><span class="install">${line.replace('#', '')}</span>`;
        }

        if (
          line
            .trim()
            .toLowerCase()
            .startsWith('# dmt-system') ||
          line.trim().startsWith('# Requirements:') ||
          line.trim().startsWith('# -')
        ) {
          return `<span class="comment">#</span><span class="violet">${line.replace('#', '')}</span>`;
        }

        if (line.trim().startsWith('#')) {
          return `<span class="comment">${line}</span>`;
        }

        line = line.replace(/\bfunction\b(.*?){/, 'function<span class="name">$1</span>');

        for (const keyword of keywords) {
          line = line.replace(new RegExp(`\\b${keyword}\\b`, 'g'), `<span class="keyword">${keyword}</span>`);
        }

        for (const cmd of commands) {
          line = line.replace(new RegExp(`\\b${cmd}\\b`, 'g'), `<span class="command">${cmd}</span>`);
        }

        return line;
      })
      .join(EOL);

    const hostname = host.replace(/:\d+$/, '');

    const htmlTemplate = fs
      .readFileSync(path.join(__dirname, 'templates/template.html'))
      .toString()
      .replace('{{demoPath}}', program.state.controller.serverMode ? '/home' : `${protocol}://${hostname}:${program.state.controller.actualGuiPort}`)
      .replace('{{content}}', content);

    res.send(htmlTemplate);
  }
}

function serverInit({ app, program, replicateUserCodeTransform, replicateExcludedByUser }) {
  const files = [];

  app.get('/', (req, res) => {
    const ua = req.headers['user-agent'];
    const isCurl = ua && ua.startsWith('curl/');
    install({ req, res, isCurl, program });
  });

  app.get('/wallpaper.jpg', (req, res) => {
    const selected = {
      theme: 'dmt_default',
      view: 'clock'
    };

    const viewDefsPath = path.join(dmt.dmtPath, 'def/gui_views.def');
    const commonAssetsPath = path.join(dmt.dmtPath, 'core/node/dmt-gui/gui-frontend-core/common_assets');

    if (fs.existsSync(viewDefsPath)) {
      const viewDef = dmt.parseDef(viewDefsPath, { caching: false }).multi.find(vd => vd.id == selected.view);
      if (viewDef) {
        const wallpaper = def.listify(viewDef.wallpaper).find(wallpaper => wallpaper.theme == selected.theme);

        if (wallpaper) {
          res.sendFile(path.join(commonAssetsPath, wallpaper.id));
          return;
        }
      }
    }

    res.sendFile(path.join(commonAssetsPath, '/wallpapers/missing.jpg'));
  });

  app.get('/logo.png', (req, res) => {
    const commonAssetsPath = path.join(dmt.dmtPath, 'core/node/dmt-gui/gui-frontend-core/common_assets');
    const logoPath = path.join(commonAssetsPath, 'img/dmt-logo.png');

    if (fs.existsSync(logoPath)) {
      res.sendFile(logoPath);
    } else {
      res.status(400).send({
        message: 'This is an error!'
      });
    }
  });

  app.get('/dmt.zip', (req, res) => {
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
  });
}

function init(program) {
  program.on('user_core_ready', ({ replicateUserCodeTransform = null, replicateExcludedByUser = null } = {}) => {
    const app = express();
    serverInit({ app, program, replicateUserCodeTransform, replicateExcludedByUser });

    const port = 1111;
    app.listen(port);

    log.green(
      `${colors.magenta('dmt-replicate')} listening on ${port} — ${colors.cyan('to replicate to another machine (from that machine)')} ${colors.gray(
        '"curl THIS_MACHINE_IP:1111 | bash"'
      )}`
    );
  });
}

module.exports = {
  init
};
