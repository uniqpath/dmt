import colors from 'kleur';

function printClientInfo({ privateKeyHex, publicKeyHex }) {
  console.log(colors.magenta('🛰️  connector (= connection initiator) created 🛰️'));
  console.log();
  console.log(colors.magenta('Generated temporary client keypair:'));
  console.log(colors.cyan(`  — Private key: ${colors.gray(privateKeyHex)}`));
  console.log(colors.cyan(`  — Public key: ${colors.gray(publicKeyHex)}`));
  console.log();
}

function printServerInfo({ privateKeyHex, publicKeyHex }) {
  console.log(colors.magenta('📡 connectionAcceptor created 📡'));
  console.log();
  console.log(colors.magenta('Generated server keypair:'));
  console.log(colors.cyan(`  — Private key: ${colors.gray(privateKeyHex)}`));
  console.log(colors.cyan(`  — Public key: ${colors.gray(publicKeyHex)}`));
  console.log();
}

export { printClientInfo, printServerInfo };
