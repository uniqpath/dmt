import { globals } from 'dmt/common';

const intervalPeriod = globals.tickerPeriod * 1000;

let tickCounter = -1;

function startTicker(program) {
  oneTick(program);
}

function oneTick(program) {
  program.emit('tick');

  if (tickCounter == globals.slowTickerFactor) {
    tickCounter = 0;
  }

  if (tickCounter == 0) {
    program.emit('slowtick');
  }

  tickCounter += 1;

  setTimeout(() => program.store().announceStateChange(), intervalPeriod / 2);

  setTimeout(() => {
    oneTick(program);
  }, intervalPeriod);
}

export default startTicker;
