const dmt = require('dmt-bridge');

const intervalPeriod = dmt.globals.tickerPeriod * 1000;

function startTicker(program) {
  oneTick(program);
}

function oneTick(program) {
  program.emit('tick');

  setTimeout(() => program.store.announceStateChange(), intervalPeriod / 2);

  setTimeout(() => {
    oneTick(program);
  }, intervalPeriod);
}

module.exports = startTicker;
