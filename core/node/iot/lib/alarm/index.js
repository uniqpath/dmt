import { push } from 'dmt/notify';

import { fsState } from 'dmt/common';

const alarmOnStateLabel = 'alarm_on';

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

      const msg = 'Alarm enabled';

      this.program.nearbyNotification({ msg, ttl: 60, color: '#EE2192', omitDeviceName: true, group: 'alarm_on' });
      push.omitDeviceName().notify(msg);
    }
  }

  disable() {
    if (this.thisDeviceManagesAlarm()) {
      if (this.isEnabled()) {
        fsState.setBool(alarmOnStateLabel, false);

        const msg = 'Alarm disabled';

        this.program.nearbyNotification({ msg, ttl: 60, color: '#5FF5B5', omitDeviceName: true, group: 'alarm_off' });
        push.omitDeviceName().notify(msg);
      }
    }
  }

  isEnabled() {
    return this.thisDeviceManagesAlarm() && fsState.getBool(alarmOnStateLabel);
  }
}

export default Alarm;
