import fs from 'fs';
import path from 'path';

import dmt from 'dmt-bridge';
const { util } = dmt;

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

function dmtSource(host) {
  if (host.includes(':')) {
    const source = dmt.user().dmtSource;
    return source ? source : '';
  } else {
    return host;
  }
}

function install({ req, res, isCurl, program, port }) {
  let host;
  let protocol = 'http';

  if (program.state.controller.serverMode) {
    host = req.headers.host;
    protocol = req.protocol;
  } else {
    host = program.state.controller.ip ? program.state.controller.ip : 'localhost';
    host = `${host}:${port}`;
  }

  const bashScript = fs
    .readFileSync(path.join(__dirname, '../templates/install_from'))
    .toString()
    .replace(new RegExp('{{protocol}}', 'g'), protocol)
    .replace(new RegExp('{{host}}', 'g'), host)
    .replace(new RegExp('{{dmtSource}}', 'g'), dmtSource(host));

  if (isCurl) {
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.send(bashScript);
  } else {
    const EOL = util.autoDetectEOLMarker(bashScript);

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
      .readFileSync(path.join(__dirname, '../templates/template.html'))
      .toString()
      .replace('{{demoPath}}', program.state.controller.serverMode ? '/home' : `${protocol}://${hostname}:${program.state.controller.actualGuiPort}`)
      .replace('{{content}}', content);

    res.send(htmlTemplate);
  }
}

export default install;
