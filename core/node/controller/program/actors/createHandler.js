import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

function createHandler({ action, actorName, program }, setupData = {}) {
  return args => {
    return new Promise((success, reject) => {
      const calledWith = args == '' ? '' : `with ${colors.white(args)}`;
      log.gray(`actor method called → ${colors.cyan(actorName)}/${colors.green(action.command)} ${calledWith}`);

      if (action.handler) {
        action
          .handler({ args, action, actorName, program }, setupData)
          .then(success)
          .catch(e => {
            log.red(`ERROR IN ACTOR ACTION: ${e.message}, please handle all errors inside actions, no error should land here!`);
            reject(e);
          });
      }
    });
  };
}

export default createHandler;
