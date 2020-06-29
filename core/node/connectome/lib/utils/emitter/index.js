import LinkedList from './linkedList.js';

let id = 0;
const splitter = /[\s,]+/g;

class Eev {
  constructor() {
    this.events = {};
  }

  on(names, fn) {
    const me = this;

    names.split(splitter).forEach(name => {
      const list = me.events[name] || (me.events[name] = new LinkedList());
      const eev = fn._eev || (fn._eev = ++id);

      list.reg[eev] || (list.reg[eev] = list.insert(fn));
    });
  }

  off(names, fn) {
    const me = this;
    fn &&
      names.split(splitter).forEach(function(name) {
        const list = me.events[name];

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
    const evt = this.events[name];
    evt && evt.head.run(data);
  }
}

export default Eev;
