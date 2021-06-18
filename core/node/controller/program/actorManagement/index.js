import dmt from 'dmt/common';
import createHandler from './createHandler';

const { util } = dmt;

class ActorManagement {
  constructor(program) {
    this.program = program;

    this.actors = {};
  }

  register({ actorName, methods, setup }, { restrictToLocal = false } = {}) {
    let setupResults;

    if (setup) {
      setupResults = setup({ program: this.program, actorName });
    }

    if (this.actors[actorName]) {
      throw new Error(`Actor ${actorName} was already registered.`);
    }

    const actorMethods = {};
    this.actors[actorName] = { actorMetadata: { restrictToLocal }, actorMethods };

    for (const method of methods) {
      const handler = createHandler({ method, actorName, program: this.program }, setupResults);
      actorMethods[method.name] = handler;
    }
  }

  setupChannel(channel) {
    for (const [actorName, actor] of Object.entries(this.actors)) {
      if (!actor.actorMetadata.restrictToLocal) {
        channel.attachObject(actorName, actor.actorMethods);
      }
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
      const actor = this.actors[actorName];

      if (actor) {
        const method = actor.actorMethods[methodName];

        if (method) {
          method(args)
            .then(success)
            .catch(reject);
        } else {
          reject(new Error(`Actor method ${actorName}/${methodName} does not exist.`));
        }
      } else {
        reject(new Error(`Actor ${actorName} does not exist.`));
      }
    });
  }

  registeredActors() {
    return Object.entries(this.actors)
      .map(([actorName, actor]) => {
        return { actorName, methodList: Object.keys(actor.actorMethods), restrictToLocal: actor.actorMetadata.restrictToLocal };
      })
      .sort(util.compareKeys('actorName'));
  }
}

export default ActorManagement;
