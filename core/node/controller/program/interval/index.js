import dmt from 'dmt/common';

const intervalPeriod = dmt.globals.tickerPeriod * 1000;

let tickCounter = 0;

function startTicker(program) {
  oneTick(program);
}

function oneTick(program) {
  program.emit('tick');

  if (tickCounter == 0) {
    program.emit('slowtick');
  }

  if (tickCounter == dmt.globals.slowTickerFactor) {
    tickCounter = 0;
  } else {
    tickCounter += 1;
  }

  setTimeout(() => program.store.announceStateChange(), intervalPeriod / 2);

  setTimeout(() => {
    oneTick(program);
  }, intervalPeriod);
}

export default startTicker;
