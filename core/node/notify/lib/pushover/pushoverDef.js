import { def, userDef } from 'dmt/common';

const config = userDef('pushover')?.pushover;

function getUserToken() {
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

function getAppGroupToken({ app, group }) {
  const groups = def.listify(getApp(app)?.group);
  return groups.find(({ id }) => id == group)?.token;
}

export { getUserToken, getFamilyGroupToken, getAppToken, getAppGroupToken };
