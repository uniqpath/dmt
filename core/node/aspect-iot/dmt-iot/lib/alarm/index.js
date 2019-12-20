const alarmOnStateLabel = 'alarm_on';
const { fsState } = require('dmt-bridge');

class Alarm {
  constructor(program) {
    this.program = program;
  }

  thisDeviceManagesAlarm() {
    return this.program.device.try('iot.alarm');
  }

  enable() {
    if (this.thisDeviceManagesAlarm()) {
      fsState.setBool(alarmOnStateLabel);
      this.program.iotMsg('alarm', 'enabled');
    }
  }

  disable() {
    if (this.thisDeviceManagesAlarm()) {
      if (this.isEnabled()) {
        fsState.setBool(alarmOnStateLabel, false);
        this.program.iotMsg('alarm', 'disabled');
      }
    }
  }

  isEnabled() {
    return this.thisDeviceManagesAlarm() && fsState.getBool(alarmOnStateLabel);
  }
}

module.exports = Alarm;
