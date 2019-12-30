const colors = require('colors');
const apn = require('../lib/apn');

function help() {
  console.log(colors.green('Send message to Apple push notifications server'));
  console.log(`${colors.yellow('Usage:')} cli push [msg]`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
function cli(argv, apn) {
  apn
    .sendAdminRaw(argv[2])
    .then(result => {
      console.log(result);
      console.log(colors.green('Push message sent'));
      process.exit();
    })
    .catch(error => {
      console.log(colors.red('Problem sending the push message:'));
      console.log(error);
    });
}

if (require.main === module) {
  help();
  console.log();
  cli(process.argv, apn);
}