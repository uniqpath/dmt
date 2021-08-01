import { globals } from 'dmt/common';

const intervalPeriod = globals.tickerPeriod;

let tickCounter = -1;

import { stores } from '../createStore/createStore.js';

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

  setTimeout(() => {
    program.store().announceStateChange();

    for (const store of Object.values(stores)) {
      store.announceStateChange();
    }
  }, intervalPeriod / 2);

  setTimeout(() => {
    oneTick(program);
  }, intervalPeriod);
}

export default startTicker;
