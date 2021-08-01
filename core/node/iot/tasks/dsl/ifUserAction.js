import { def } from 'dmt/common';

import * as helpers from './helpers';

const statementName = 'if-user-action';

function parseIfUserAction({ taskDef, program }) {
  if (taskDef['if-user-action']) {
    program.on('dmt_gui_action', ({ action, namespace }) => {
      for (const ifUserAction of def.listify(taskDef[statementName])) {
        if (namespace == 'iot' && action == ifUserAction.id) {
          for (const topicAndMsg of def.values(ifUserAction.emit)) {
            helpers.iotMsg({ program, topicAndMsg, context: statementName });
          }
        }
      }
    });
  }
}

export default parseIfUserAction;
