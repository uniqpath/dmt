import { log, colors } from 'dmt/common';

import createHandler from './createHandler.js';

import { util } from 'dmt/common';

class ActorManagement {
  constructor(program) {
    this.program = program;

    this.actors = {};
  }

  register({ apiName, methods, setup }, { restrictToLocal = false } = {}) {
    let setupResults;

    if (setup) {
      setupResults = setup({ program: this.program, apiName });
    }

    if (this.actors[apiName]) {
      throw new Error(`Actor ${apiName} was already registered.`);
    }

    const actorMethods = {};
    this.actors[apiName] = { actorMetadata: { restrictToLocal }, actorMethods };

    for (const method of methods) {
      const handler = createHandler({ method, apiName, program: this.program }, setupResults);
      actorMethods[method.name] = handler;
    }
  }

  setupChannel(channel) {
    for (const [apiName, actor] of Object.entries(this.actors)) {
      if (!actor.actorMetadata.restrictToLocal) {
        channel.attachObject(apiName, actor.actorMethods);
      }
    }
  }

  get(apiName) {
    return {
      call: (methodName, args) => {
        return this.call(apiName, methodName, args);
      }
    };
  }

  call(apiName, methodName, args) {
    return new Promise((success, reject) => {
      const actor = this.actors[apiName];

      if (actor) {
        const method = actor.actorMethods[methodName];

        if (method) {
          method(args)
            .then(success)
            .catch(reject);
        } else {
          reject(new Error(`Actor method ${apiName}/${methodName} does not exist.`));
        }
      } else {
        log.red(
          `⚠️  Program API ${colors.magenta(apiName)} is not registered (yet?) — ignoring call to ${colors.yellow(apiName)}/${colors.yellow(methodName)}`
        );
      }
    });
  }

  registeredActors() {
    return Object.entries(this.actors)
      .map(([apiName, actor]) => {
        return { apiName, methodList: Object.keys(actor.actorMethods), restrictToLocal: actor.actorMetadata.restrictToLocal };
      })
      .sort(util.orderBy('apiName'));
  }
}

export default ActorManagement;
