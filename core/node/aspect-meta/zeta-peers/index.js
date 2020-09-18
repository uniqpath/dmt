import os from 'os';
import fs from 'fs';

import dmt from 'dmt/bridge';
const { log } = dmt;

import fetchPeerList from './lib/fetchPeerList';
import peerlist from './lib/peerlist';
import isReefBuilder from './lib/isReefBuilder';

import { peerFilePath } from './lib/paths';

function fetchPeers({ program, peerFilePath }) {
  fetchPeerList()
    .then(peers => {
      program.updatePeerlist(peers);
      fs.writeFileSync(peerFilePath, peers.join(os.EOL).concat(os.EOL));
    })
    .catch(e => {});
}

function refreshPeers(program) {
  program.updatePeerlist(peerlist());

  if (isReefBuilder()) {
    return;
  }

  if (fs.existsSync(peerFilePath)) {
    fs.stat(peerFilePath, (err, stats) => {
      if (err) {
        log.red(`Error when stat ${peerFilePath}: ${err.toString()}`);
        return;
      }

      const { mtimeMs } = stats;
      const diff = Date.now() - mtimeMs;

      const refreshMin = 1;

      if (diff > refreshMin * 60 * 1000) {
        fetchPeers({ program, peerFilePath });
      }
    });
  } else {
    fetchPeers({ program, peerFilePath });
  }
}

function init(program) {
  program.on('slow_tick', () => {
    refreshPeers(program);
  });

  refreshPeers(program);
}

export { init };
