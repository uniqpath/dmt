import WritableStore from './helperStores/writableStore.js';

class LogStore extends WritableStore {
  constructor() {
    super({ log: [] });
  }

  addToLog({ origConsoleLog, limit }, ...args) {
    if (args.length == 1) {
      args = args[0];
    }

    let { log } = this.get();

    if (typeof args == 'string') {
      log.push(args);
    } else {
      try {
        log.push(`${JSON.stringify(args)}`);
      } catch (e) {
        log.push(args);
      }
    }

    log = log.slice(-limit);

    this.set({ log });
  }
}

export default LogStore;
