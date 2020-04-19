import colors from 'colors';

import dmt from 'dmt-bridge';
const { log } = dmt;

function createHandler({ action, actorName, program }, setupData = {}) {
  return args => {
    return new Promise(success => {
      const calledWith = args == '' ? '' : `with ${colors.white(args)}`;
      log.gray(`actor method called → ${colors.cyan(actorName)}/${colors.green(action.command)} ${calledWith}`);

      if (action.handler) {
        action
          .handler({ args, action, actorName, program }, setupData)
          .then(success)
          .catch(err => {
            log.red(err);
            success({ error: err.message });
          });
      }
    });
  };
}

class Actors {
  constructor(program) {
    this.program = program;
    this.methods = {};
    this.nameList = [];
  }

  register({ actorName, actions, setup }) {
    this.nameList.push(actorName);
    this.addMethods({ actorName, actions, setup });
  }

  addMethods({ actorName, actions, setup }) {
    let setupResults;

    if (setup) {
      setupResults = setup({ program: this.program, actorName });
    }

    for (const action of actions) {
      this.methods[`${actorName}/${action.command}`] = createHandler({ action, actorName, program: this.program }, setupResults);
    }
  }

  get(actorName) {
    return {
      call: (methodName, args) => {
        return this.call(actorName, methodName, args);
      }
    };
  }

  call(actorName, methodName, args) {
    const ref = `${actorName}/${methodName}`;

    return new Promise((success, reject) => {
      const method = this.methods[ref];
      if (method) {
        method(args).then(success);
      } else {
        reject(new Error(`Actor method ${ref} does not exist.`));
      }
    });
  }
}

export default Actors;
