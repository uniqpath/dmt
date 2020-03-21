import os from 'os';
import fs from 'fs';
import dmt from 'dmt-bridge';
const { log } = dmt;

import * as tools from './tools';
const { newKeypair } = tools;

function generateKeyPair(defFilePath) {
  const { publicKey, privateKey } = newKeypair();
  log.green('✓ Keypair generated.');
  const def = ['key:', `  public: ${publicKey}`, `  private: ${privateKey}`, ''];
  fs.writeFileSync(defFilePath, def.join(os.EOL));
}

function init(program) {
  const keyDefFilePath = dmt.deviceKeyDefFile();

  if (!fs.existsSync(keyDefFilePath)) {
    log.write('Default keypair for this device not present. Generating ...');
    generateKeyPair(keyDefFilePath);
  }
}

export { init };