const colors = require('colors');

const def = require('../def/parser');
const dmt = require('../def/dmtHelper');
const util = require('../../util.js');

const parser = require('./parser');

function parseArgs(allArgs) {
  const parsedArgs = parser(allArgs);

  if (dmt.debugMode()) {
    console.log(colors.yellow('Parsed arguments:'));
    util.dir(parsedArgs);
  }

  const errors = parsedArgs.filter(arg => arg.error);
  if (errors.length > 0) {
    for (const arg of errors) {
      console.log(colors.red(`Error: ${arg.error}`));
    }
    process.exit();
  }

  const atArguments = parsedArgs.filter(arg => arg.type == 'attr');
  const terms = parsedArgs.map(arg => (arg.term ? arg.originalArg : arg)).filter(arg => typeof arg == 'string');

  const atDevices = [];

  atDevices.push(
    ...atArguments
      .filter(arg => !arg.value)
      .map(device => dmt.convertParsedAtAttributeToDmtAccessData(device))
      .filter(k => k.host)
  );

  if (atDevices.length == 0) {
    atDevices.push(dmt.convertParsedAtAttributeToDmtAccessData(parser(['@this'])[0]));
  }

  atDevices.forEach(device => {
    device.address = dmt.hostAddress(device);

    if (!device.port && device.hostType == 'dns') {
      device.port = '80';
    }
  });

  const attributeOptions = {};

  atArguments
    .filter(arg => arg.value)
    .forEach(attr => {
      attributeOptions[attr.name] = attr.value;
    });

  if (dmt.debugMode()) {
    console.log(colors.green(`atDevices: ${colors.gray(atDevices.map(d => d.host))}`));
    console.log(colors.yellow(`attributeOptions: ${colors.gray(JSON.stringify(attributeOptions, null, 2))}`));
    console.log(colors.yellow(`terms: ${colors.gray(JSON.stringify(terms, null, 2))}`));
  }

  return { terms, attributeOptions, atDevices };
}

module.exports = parseArgs;
