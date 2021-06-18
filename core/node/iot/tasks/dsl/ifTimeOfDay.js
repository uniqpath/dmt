import dmt from 'dmt/common';

const { def, suntime } = dmt;

import * as helpers from './helpers';

const eveningRE = new RegExp(/\bevening\b/i);
const lateEveningRE = new RegExp(/\blate-evening\b/i);
const nightRE = new RegExp(/\bnight\b/i);

const statementName = 'if-time-of-day';

class IfTimeOfDay {
  constructor(task) {
    this.task = task;

    const { taskDef } = this.task;

    if (taskDef[statementName]) {
      this.ifStatements = def.listify(taskDef[statementName]);
    } else {
      this.ifStatements = [];
    }
  }

  tick() {
    const { program } = this.task;

    if (program.latlng()) {
      const latlng = program.latlng();

      const location = [parseFloat(latlng.split(',')[0]), parseFloat(latlng.split(',')[1])];

      for (const ifTimeOfDay of this.ifStatements) {
        const tods = ifTimeOfDay.id;
        let bool = false;

        if (tods.match(lateEveningRE)) {
          bool = bool || suntime.isLateEvening(location);
        } else if (tods.match(eveningRE)) {
          bool = bool || suntime.isEvening(location);
        }

        if (tods.match(nightRE)) {
          bool = bool || suntime.isNight(location);
        }

        const values = bool ? def.values(ifTimeOfDay.emit) : def.values(ifTimeOfDay.else);

        for (const topicAndMsg of values) {
          helpers.iotMsg({ program, topicAndMsg, context: statementName });
        }
      }
    }
  }
}

export default IfTimeOfDay;
