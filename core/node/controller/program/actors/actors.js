import createHandler from './createHandler';

class Actors {
  constructor(program) {
    this.program = program;

    this.actors = {};
  }

  register({ actorName, actions, setup }) {
    let setupResults;

    if (setup) {
      setupResults = setup({ program: this.program, actorName });
    }

    for (const action of actions) {
      const handler = createHandler({ action, actorName, program: this.program }, setupResults);
      this.actors[actorName] = this.actors[actorName] || {};
      this.actors[actorName][action.command] = handler;
    }
  }

  setupChannel(channel) {
    for (const [actorName, actor] of Object.entries(this.actors)) {
      channel.registerRemoteObject(actorName, actor);
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
    return new Promise((success, reject) => {
      const method = this.actors[actorName][methodName];
      if (method) {
        method(args)
          .then(success)
          .catch(reject);
      } else {
        reject(new Error(`Actor method ${actorName}/${methodName} does not exist.`));
      }
    });
  }
}

export default Actors;
