import dmt from 'dmt-bridge';
import WebSocket from 'ws';
import colors from 'colors';

import constructAction from '../gui-backend/ws_servers/constructAction';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('index.js [ip] [action] [store] [payload]')} ${colors.gray('')}`);
  process.exit();
}

const endpoint = args.length > 0 ? args[0] : 'localhost';

let payload;

if (args.length > 3) {
  payload = args[3];
}

try {
  const ws = new WebSocket(`ws://${endpoint}:${dmt.services('gui').wsPort}`);

  ws.on('message', data => {
    process.exit();
  });

  ws.on('open', () => {
    ws.send(constructAction({ action: args[1], storeName: args[2], payload }));
  });
} catch (e) {
  console.log(e);
}
