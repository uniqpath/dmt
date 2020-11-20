import LinkedList from './linkedList.js';

let id = 0;
const splitter = /[\s,]+/g;

class Eev {
  constructor() {
    this.__events_list = {};
  }

  on(names, fn) {
    names.split(splitter).forEach(name => {
      const list = this.__events_list[name] || (this.__events_list[name] = new LinkedList());
      const eev = fn._eev || (fn._eev = ++id);

      list.reg[eev] || (list.reg[eev] = list.insert(fn));
    });
  }

  off(names, fn) {
    fn &&
      names.split(splitter).forEach(name => {
        const list = this.__events_list[name];

        if (!list) {
          return;
        }

        const link = list.reg[fn._eev];

        list.reg[fn._eev] = undefined;

        list && link && list.remove(link);
      });
  }

  removeListener(...args) {
    this.off(...args);
  }

  emit(name, data) {
    const evt = this.__events_list[name];
    evt && evt.head.run(data);
  }
}

export default Eev;
