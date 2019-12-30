const dmt = require('dmt-bridge');
const { def } = dmt;

const { push } = require('dmt-notify');

const helpers = require('./helpers');

const statementName = 'if-msg';

class IfMsg {
  constructor({ task, program }) {
    this.task = task;
    this.program = program;

    const { taskDef } = this.task;

    if (taskDef[statementName]) {
      this.ifStatements = def.listify(taskDef[statementName]);
    } else {
      this.ifStatements = [];
    }
  }

  handleIotEvent({ topic, msg }) {
    for (const ifMsg of this.ifStatements) {
      const topicAndMsg = ifMsg.id;

      if (helpers.compareTopicAndMsg({ topicAndMsg, topic, msg, context: statementName })) {
        for (const pushMsg of def.listify(ifMsg.push)) {
          const message = pushMsg.id;
          if (pushMsg.onlyAdmin) {
            push.notify(message);
          } else {
            push.notifyAll(message);
          }
        }

        for (const topicAndMsg of def.values(ifMsg.emit)) {
          helpers.iotMsg({ program: this.program, topicAndMsg, context: statementName });
        }
      }
    }
  }
}

module.exports = IfMsg;