import fs from 'fs';
import path from 'path';

import * as dmt from 'dmt/common';
const { util, dmtVersion } = dmt;

import determineReplicatedDmtVersion from '../determineReplicatedDmtVersion';

const { dirname } = path;
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

function dmtSource(host) {
  if (host.includes(':')) {
    const source = dmt.user().dmtSource;
    return source || '';
  }

  return host;
}

function install({ req, res, isCurl, program, port }) {
  let host;
  let protocol = 'http';

  if (program.store('device').get('serverMode')) {
    host = req.headers.host;
    protocol = req.protocol;
  } else {
    host = program.store('device').get('ip') || 'localhost';
    host = `${host}:${port}`;
  }

  const bashScript = fs
    .readFileSync(path.join(__dirname, '../templates/install_from'))
    .toString()
    .replace(new RegExp('{{protocol}}', 'g'), protocol)
    .replace(new RegExp('{{version}}', 'g'), determineReplicatedDmtVersion())
    .replace(new RegExp('{{host}}', 'g'), host)
    .replace(new RegExp('{{dmtSource}}', 'g'), dmtSource(host));

  const EOL = util.autoDetectEOLMarker(bashScript);

  const lines = bashScript.split(EOL);

  for (let i = 0; i < lines.length; i++) {
    const num = `<span class="line_number">${(i + 1).toString().padStart(3, ' ')}</span>`;
    lines[i] = {
      num,
      line: lines[i]
    };
  }

  if (isCurl) {
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.send(bashScript);
  } else {
    const keywords = ['function', 'if', 'fi', 'then', 'else', 'eval', 'local', 'return', 'echo', 'printf', 'exit'];

    const commands = ['unzip', 'mv', 'cd', 'rm', 'mkdir', 'pwd'];

    const content = lines
      .map(({ num, line }) => {
        if (line.trim().startsWith('#!/bin/bash')) {
          return `${num} <span class="shebang">${line}</span>`;
        }

        if (line.trim().startsWith('# RPi')) {
          return `${num} <span class="comment">#</span><span class="green">${line.replace('#', '')}</span>`;
        }

        if (line.trim().startsWith('# curl')) {
          return `${num} <span class="comment">#</span><span class="install">${line.replace('#', '')}</span>`;
        }

        if (
          line
            .trim()
            .toLowerCase()
            .startsWith('# dmt-system') ||
          line.trim().startsWith('# Requirements:') ||
          line.trim().startsWith('# -')
        ) {
          return `${num} <span class="comment">#</span><span class="violet">${line.replace('#', '')}</span>`;
        }

        if (line.trim().startsWith('#')) {
          return `${num} <span class="comment">${line}</span>`;
        }

        line = line.replace(/\bfunction\b(.*?){/, 'function<span class="name">$1</span>');

        for (const keyword of keywords) {
          line = line.replace(new RegExp(`\\b${keyword}\\b`, 'g'), `<span class="keyword">${keyword}</span>`);
        }

        for (const cmd of commands) {
          line = line.replace(new RegExp(`\\b${cmd}\\b`, 'g'), `<span class="command">${cmd}</span>`);
        }

        return `${num} ${line}`;
      })
      .join(EOL);

    const hostname = host.replace(/:\d+$/, '');

    const htmlTemplate = fs
      .readFileSync(path.join(__dirname, '../templates/template.html'))
      .toString()
      .replace(
        '{{demoPath}}',
        program.store('device').get('serverMode') ? '/home' : `${protocol}://${hostname}:${program.store('device').get('actualGuiPort')}`
      )
      .replace('{{content}}', content);

    res.send(htmlTemplate);
  }
}

export default install;
