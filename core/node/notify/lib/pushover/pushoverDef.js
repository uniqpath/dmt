import { def, userDef } from 'dmt/common';

const config = userDef('pushover')?.pushover;

function getMainUserToken() {
  return config?.user;
}

function getFamilyGroupToken() {
  return config?.group;
}

function getApp(app) {
  return def.listify(config?.app)?.find(({ id }) => id == app);
}

function getAppToken(app) {
  return getApp(app)?.token;
}

function getAppGroup({ app, group }) {
  const groups = def.listify(getApp(app)?.group);
  return groups.find(({ id }) => id == group);
}

function getAppGroupToken({ app, group }) {
  return getAppGroup({ app, group })?.token;
}

function getAppGroupUsers({ app, group }) {
  return getAppGroup({ app, group })?.users;
}

function getUserToken(user) {
  if (config?.users) {
    return config?.users[user.toLowerCase()];
  }
}

export { getMainUserToken, getFamilyGroupToken, getAppToken, getAppGroupToken, getAppGroupUsers, getUserToken };
