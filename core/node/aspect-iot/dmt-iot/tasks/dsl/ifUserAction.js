import dmt from 'dmt-bridge';

const { def } = dmt;

import * as helpers from './helpers';

const statementName = 'if-user-action';

function parseIfUserAction({ taskDef, program }) {
  if (taskDef['if-user-action']) {
    program.on('action', ({ action, storeName }) => {
      for (const ifUserAction of def.listify(taskDef[statementName])) {
        if (storeName == 'iot' && action == ifUserAction.id) {
          for (const topicAndMsg of def.values(ifUserAction.emit)) {
            helpers.iotMsg({ program, topicAndMsg, context: statementName });
          }
        }
      }
    });
  }
}

export default parseIfUserAction;
