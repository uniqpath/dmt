const fs = require('fs');
const scan = require('../../scan');
const util = require('../../util');

function valueForKey({ lines, key, delimiter }) {
  const line = lines.find(line => line.trim().startsWith(`${key}${delimiter}`));
  return line
    ? line
        .split(delimiter)
        .slice(1)
        .join(delimiter)
        .trim()
    : undefined;
}

function mapKey(key, keyMap) {
  return keyMap[key] ? keyMap[key] : key;
}

function parser({ filePath, content, lines, keys, keyMap = {}, delimiter = '=' }) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      lines = scan.readFileLines(filePath);
    } catch (e) {
      return {};
    }
  }

  if (content) {
    const EOL = util.autoDetectEOLMarker(content);
    lines = content.split(EOL);
  }

  const obj = {};

  for (const key of util.listify(keys)) {
    obj[mapKey(key, keyMap)] = valueForKey({ lines, key, delimiter });
  }

  return obj;
}

module.exports = parser;

if (require.main === module) {
  const keys = ['ssid', 'wpa_passphrase'];
  const keyMap = { wpa_passphrase: 'password' };

  const content = `
interface=wlan0
ssid=DMT-AP
wpa_passphrase=password
`;
  const result = parser({ content, keys, keyMap });
  console.log(result);
}
