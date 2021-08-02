import dmt from 'dmt/common';
const { def, log } = dmt;

import { push } from 'dmt/notify';

import * as helpers from './helpers';

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
          const networkName = this.program.network.name();

          if (pushMsg.onlyAdmin) {
            push.omitDeviceName().notify(message, { networkName });
          } else {
            push.omitDeviceName().notifyAll(message, { networkName });
          }
        }

        for (const topicAndMsg of def.values(ifMsg.emit)) {
          helpers.iotMsg({ program: this.program, topicAndMsg, context: statementName });
        }
      }
    }
  }
}

export default IfMsg;
