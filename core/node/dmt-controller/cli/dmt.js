const colors = require('colors');

const dmt = require('dmt-bridge');
const { util, cli } = dmt;

const rpc = require('dmt-rpc');
const Remote = rpc.Client;

const { cliResolveIp } = require('dmt-nearby');

function printSuccessOrErrorStatus(response) {
  if (response.error) {
    console.log(colors.red(`⮑  ${response.error.message}`));
  } else {
    console.log(colors.green('⮑  Success'));
  }
}

function printResponse(command, response) {
  const receivedData = response.result;
  if (!response.error) {
    if (command == 'log') {
      console.log();
      for (const line of receivedData) {
        console.log(line);
      }
    } else if (receivedData) {
      util.dir(receivedData);
    } else {
    }
  }
  printSuccessOrErrorStatus(response);
}

async function executeRpcCommands({ command, device, address, terms }) {
  let index = -1;
  index += 1;
  if (!address) {
    console.log(colors.red(`Unknown address for ${device.id}`));
    process.exit();
  }

  try {
    const remote = new Remote({ targetService: 'controller', host: address });
    console.log(`${colors.magenta(device.host)}: ${colors.gray(address)} ${colors.green(`Ξ ${command.toUpperCase()}`)}`);
    const response = await dmt.promiseTimeout(dmt.globals.networkLimit.maxTimeOneHop, remote.action(command, terms));
    printResponse(command, response);
  } catch (e) {
    rpc.errorFormatter(e, { host: address });
    console.log(
      colors.gray(`   If ${colors.cyan('DMT Controller')} is not running on ${colors.cyan(address)}, please start it with ${colors.green('dmt start')}`)
    );
  }
}

if (require.main === module) {
  try {
    const allArgs = process.argv.slice(2);
    const { terms, atDevices } = cli(allArgs);

    if (atDevices.length > 1) {
      console.log(colors.red('TODO -- easy to implement, not sure if useful... worked before with previous non-dynamic device resolution'));
      process.exit();
    }

    const command = terms.shift() || 'help';

    (async () => {
      const device = atDevices[0];

      if (device.localhost) {
        await executeRpcCommands({ command, device, address: 'localhost', terms });
        process.exit();
      } else {
        cliResolveIp({ deviceId: device.host }).then(ip => {
          (async () => {
            await executeRpcCommands({ command, device, address: ip, terms });
            process.exit();
          })();
        });
      }
    })();
  } catch (e) {
    console.log(colors.red(e.message));
  }
}
