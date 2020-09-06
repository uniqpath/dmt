import fs from 'fs';
import dmt from 'dmt/bridge';

const { scan } = dmt;

import { zetaDeviceMasterPeerlistFilePath, peerFilePath } from './paths';

function readFile(filePath) {
  return scan
    .readFileLines(filePath)
    .map(line => line.split('#')[0].trim())
    .filter(line => line != '');
}

function peerlist() {
  if (fs.existsSync(zetaDeviceMasterPeerlistFilePath)) {
    return readFile(zetaDeviceMasterPeerlistFilePath).filter(peer => peer != 'zetaseek.com');
  }

  if (fs.existsSync(peerFilePath)) {
    return readFile(peerFilePath);
  }

  return [];
}

export default peerlist;
