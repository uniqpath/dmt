import { log, colors } from 'dmt/common';

function createHandler({ method, actorName, program }, setupData = {}) {
  return args => {
    return new Promise((success, reject) => {
      const calledWith = args ? `with ${colors.white(args)}` : '';
      log.gray(`actor method called → ${colors.cyan(actorName)}/${colors.green(method.name)} ${calledWith}`);

      if (method.handler) {
        method
          .handler({ args, method, actorName, program }, setupData)
          .then(success)
          .catch(reject);
      }
    });
  };
}

export default createHandler;
