import fs from 'fs';
import scan from './scan';

import { textfileKeyValueParser } from './parsers/textfiles';

export { apMode, apInfo, accessPointIP };

function apMode() {
  const filePath = '/etc/network/interfaces';
  if (fs.existsSync(filePath)) {
    try {
      const lines = scan.readFileLines(filePath);
      return !!lines.find(line => line.startsWith('hostapd '));
    } catch (e) {
      return false;
    }
  }

  return false;
}

function apInfo() {
  const filePath = '/etc/hostapd/hostapd.conf';
  const keys = ['ssid', 'wpa_passphrase'];
  const keyMap = { wpa_passphrase: 'password' };

  return textfileKeyValueParser({ filePath, keys, keyMap });
}

const accessPointIP = '192.168.1.1';
