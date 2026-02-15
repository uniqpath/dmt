import fs from 'fs';
import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

let cached;

function settings() {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json')));
  }
  return cached;
}

export default settings;
