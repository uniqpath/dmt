import SimpleStore from './simpleStore.js';

class LogStore extends SimpleStore {
  constructor() {
    super();

    this.set({ log: [] });
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
