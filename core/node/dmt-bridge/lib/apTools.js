const fs = require('fs');
const scan = require('./scan');

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

function valueForKey(lines, key) {
  const line = lines.find(line => line.startsWith(`${key}=`));
  return line.split('=')[1];
}

function mapKey(key) {
  switch (key) {
    case 'wpa_passphrase':
      return 'password';
    default:
      return key;
  }
}

function apInfo() {
  const filePath = '/etc/hostapd/hostapd.conf';

  const empty = { empty: true };

  if (fs.existsSync(filePath)) {
    try {
      const lines = scan.readFileLines(filePath);

      const obj = {};

      for (const key of ['ssid', 'wpa_passphrase']) {
        obj[mapKey(key)] = valueForKey(lines, key);
      }

      return obj;
    } catch (e) {
      return empty;
    }
  }

  return empty;
}

const accessPointIP = '192.168.1.1';

module.exports = { apMode, apInfo, accessPointIP };

if (require.main === module) {
  console.log(`AP MODE: ${apMode()}`);
  console.log('AP INFO:');
  console.log(apInfo());
}
