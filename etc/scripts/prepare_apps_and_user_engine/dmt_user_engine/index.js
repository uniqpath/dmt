import dmt from 'dmt/common';
const { log } = dmt;

function init(program) {
  log.green(`DMT USER ENGINE on ${program.device.id} loaded!`);
}

export { init };
