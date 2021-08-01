import colors from 'colors';
import dmt from 'dmt/common';
const { log } = dmt;

import { spawn } from 'child_process';

export default getMAC;

function getMAC(ipaddress, cb) {
  if (process.platform.indexOf('linux') == 0) {
    return readMACLinux(ipaddress, cb);
  }

  if (process.platform.indexOf('win') == 0) {
    return readMACWindows(ipaddress, cb);
  }

  if (process.platform.indexOf('darwin') == 0) {
    return readMACMac(ipaddress, cb);
  }
}

function readMACLinux(ipaddress, cb) {
  const ping = spawn('ping', ['-c', '1', ipaddress]);

  ping.on('close', code => {
    const arp = spawn('ip', ['neigh']);
    let buffer = '';
    let errbuffer = '';

    arp.stdout.on('data', data => {
      buffer += data;
    });
    arp.stderr.on('data', data => {
      errbuffer += data;
    });

    arp.on('close', code => {
      if (code !== 0) {
        log.write(`Error running arp ${code} ${errbuffer}`);
        cb(true, code);
        return;
      }

      const table = buffer.split('\n');
      const rows = table.filter(row => row.match(new RegExp(`${ipaddress} `)) && row.match(/[0-9a-f]:/));
      if (rows.length == 0) {
        log.write(colors.red(`Cannot read mac address of ${ipaddress}, ip neigh:`));
        log.write(JSON.stringify(table, null, 2));
        cb(true, -1000);
        return;
      }

      const mac = rows[0].split(' ')[4];

      cb(false, mac);
    });
  });
}

function readMACWindows(ipaddress, cb) {
  var ping = spawn('ping', ['-n', '1', ipaddress]);

  ping.on('close', function(code) {
    var arp = spawn('arp', ['-a', ipaddress]);
    var buffer = '';
    var errstream = '';
    var lineIndex;

    arp.stdout.on('data', function(data) {
      buffer += data;
    });
    arp.stderr.on('data', function(data) {
      errstream += data;
    });

    arp.on('close', function(code) {
      if (code !== 0) {
        console.log('Error running arp ' + code + ' ' + errstream);
        cb(true, code);
        return;
      }

      var table = buffer.split('\r\n');
      for (lineIndex = 3; lineIndex < table.length; lineIndex++) {
        var parts = table[lineIndex].split(' ').filter(String);
        if (parts[0] === ipaddress) {
          var mac = parts[1].replace(/-/g, ':');
          cb(false, mac);
          return;
        }
      }
      cb(true, `Could not find ip in arp table: ${ipaddress}`);
    });
  });
}
function readMACMac(ipaddress, cb) {
  const ping = spawn('ping', ['-c', '1', ipaddress]);

  ping.on('close', function(code) {
    const arp = spawn('arp', ['-n', ipaddress]);
    let buffer = '';
    let errstream = '';
    arp.stdout.on('data', data => {
      buffer += data;
    });
    arp.stderr.on('data', data => {
      errstream += data;
    });

    arp.on('close', code => {
      if (code !== 0 && errstream !== '') {
        console.log(`Error running arp ${code} ${errstream}`);
        cb(true, code);
        return;
      }

      const re = new RegExp(/\d\d:\d\d:/);

      const line = buffer
        .split('\n')
        .filter(line => line.trim() != '')
        .find(line => line.match(re));

      if (line) {
        const parts = line.split(' ').filter(String);
        const mac = parts[3]
          .replace(/^0:/g, '00:')
          .replace(/:0:/g, ':00:')
          .replace(/:0$/g, ':00')
          .replace(/:([^:]{1}):/g, ':0$1:');
        cb(false, mac);
        return;
      }

      cb(true, `Could not find ip in arp table: ${ipaddress}`);
    });
  });
}
