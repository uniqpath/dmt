import colors from 'colors';

function printClientInfo({ privateKeyHex, publicKeyHex }) {
  console.log(colors.green('Client'));
  console.log(colors.green('------'));
  console.log();
  console.log(colors.magenta('Generated session keypair:'));
  console.log(colors.cyan(`  — Private key: ${colors.gray(privateKeyHex)}`));
  console.log(colors.cyan(`  — Public key: ${colors.gray(publicKeyHex)}`));
  console.log();
}

function printServerInfo({ privateKeyHex, publicKeyHex }) {
  console.log(colors.green('Server'));
  console.log(colors.green('------'));
  console.log();
  console.log(colors.magenta('Generated server keypair:'));
  console.log(colors.cyan(`  — Private key: ${colors.gray(privateKeyHex)}`));
  console.log(colors.cyan(`  — Public key: ${colors.gray(publicKeyHex)}`));
  console.log();
}

export { printClientInfo, printServerInfo };
