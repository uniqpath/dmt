import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

function createHandler({ method, actorName, program }, setupData = {}) {
  return args => {
    return new Promise((success, reject) => {
      const calledWith = args == '' ? '' : `with ${colors.white(args)}`;
      log.gray(`actor method called → ${colors.cyan(actorName)}/${colors.green(method.name)} ${calledWith}`);

      if (method.handler) {
        method
          .handler({ args, method, actorName, program }, setupData)
          .then(success)
          .catch(e => {
            log.red(`ERROR IN ACTOR ACTION: please handle all errors inside actions, no error should land here!`);
            log.red(e);
            reject(e);
          });
      }
    });
  };
}

export default createHandler;
