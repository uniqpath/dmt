import os from 'os';
import fs from 'fs';

import { log, keypair, deviceKeyDefFile } from 'dmt/common';

import { tools } from 'dmt/crypto';
const { newKeypair } = tools;

function generateKeyPair(defFilePath) {
  const { publicKeyHex, privateKeyHex } = newKeypair();
  log.green('✓ Keypair generated.');
  const def = ['key:', `  public: ${publicKeyHex}`, `  private: ${privateKeyHex}`, ''];
  fs.writeFileSync(defFilePath, def.join(os.EOL));
}

function generate() {
  const keyDefFilePath = deviceKeyDefFile();

  if (!fs.existsSync(keyDefFilePath)) {
    log.write('Default keypair for this device not present. Generating ...');
    generateKeyPair(keyDefFilePath);

    if (!keypair()) {
      log.red('Warning: keypair generation failed...');
    }
  }
}

export default generate;
