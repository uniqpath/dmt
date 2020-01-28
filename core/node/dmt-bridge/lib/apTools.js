const fs = require('fs');
const scan = require('./scan');
const { textfileKeyValueParser } = require('./parsers/textfiles');

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

module.exports = { apMode, apInfo, accessPointIP };

if (require.main === module) {
  console.log(`AP MODE: ${apMode()}`);
  console.log('AP INFO:');
  console.log(apInfo());
}
