import dmt from 'dmt/bridge';

const intervalPeriod = dmt.globals.tickerPeriod * 1000;

let tickCounter = 0;

function startTicker(program) {
  oneTick(program);
}

function oneTick(program) {
  program.emit('tick');

  if (tickCounter == 10) {
    program.emit('slow_tick');
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
