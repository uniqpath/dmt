const dmt = require('dmt-bridge');

const { def } = dmt;

const helpers = require('./helpers');

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

module.exports = parseIfUserAction;
