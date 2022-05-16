import { def, log } from 'dmt/common';

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

  handleMqttEvent({ topic, msg }) {
    for (const ifMsg of this.ifStatements) {
      const topicAndMsg = ifMsg.id;

      if (helpers.compareTopicAndMsg({ topicAndMsg, topic, msg, context: statementName })) {
        for (const notif of def.listify(ifMsg.notify)) {
          const msg = notif.id;

          if (notif.onlyAdmin) {
            push.omitDeviceName().notify(msg);
          } else {
            push.omitDeviceName().notifyAll(msg);
          }

          log.cyan(notif);

          if (notif.color) {
            let group;
            if (notif.dedup == 'true') {
              group = `___iot/${topic}/${msg}`;
            }
            this.program.nearbyNotification({ msg, ttl: notif.ttl, color: `#${notif.color}`, group, omitDeviceName: true });
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
