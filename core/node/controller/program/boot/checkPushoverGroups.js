import { def, userDef, colors, log } from 'dmt/common';

const config = userDef('pushover')?.pushover;

export default function checkPushoverGroups() {
  let errors = false;

  if (config) {
    const definedUsers = Object.keys(config.users || {});

    for (const app of def.listify(config?.app)) {
      for (const group of def.listify(app?.group)) {
        if (group.users) {
          const users = group.users.replaceAll(' ', '').split(',');
          for (const user of users) {
            if (!definedUsers.includes(user)) {
              log.red(`Unknown user ${colors.yellow(user)} in group ${colors.yellow(app.id)}/${colors.cyan(group.id)}`);
              errors = true;
            }
          }
        }
      }
    }

    if (errors) {
      throw new Error('Some undefined users in pushover.def groups - check dmt.log...');
    }
  }
}
