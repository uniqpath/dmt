import util from '../../util';
import * as dmt from '../../dmtHelper';
import parser from './parser';
import parseDeviceMention from './parseDeviceMention';

const { colors } = dmt;

function parseArgs(allArgs) {
  const parsedArgs = parser(allArgs);

  if (dmt.debugMode()) {
    console.log(colors.yellow('Parsed arguments:'));
    util.dir(parsedArgs);
  }

  const atArguments = parsedArgs.filter(arg => arg.type == 'attr');
  const terms = parsedArgs.map(arg => (arg.term ? arg.originalArg : arg)).filter(arg => typeof arg == 'string' && arg.trim() != '');

  const atDevices = [];

  atDevices.push(
    ...atArguments
      .filter(arg => !arg.value)
      .map(device => parseDeviceMention(device))
      .filter(k => k.host)
  );

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

export default parseArgs;
