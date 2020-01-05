const WebSocket = require('ws');
const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const name = 'gui websocket';
const GuiResponder = require('./wsResponder');

function listen(program) {
  const port = dmt.services('gui').wsPort;

  log.green('%s listening at ws://%s:%s', name || 'Server', 'localhost', port);

  const guiResponder = new GuiResponder();
  guiResponder.init({ program, port });
}

module.exports = { listen };

if (require.main === module) {
  const constructAction = require('./constructAction');

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
      console.log(data);
    });

    ws.on('open', () => {
      ws.send(constructAction({ action: args[1], storeName: args[2], payload }));
    });
  } catch (e) {}
}
