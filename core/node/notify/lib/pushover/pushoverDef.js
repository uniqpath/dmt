import dmt from 'dmt/common';
const { def } = dmt;

const config = dmt.userDef('pushover')?.pushover;

function getApp(app) {
  return def.listify(config?.app)?.find(({ id }) => id == app);
}

function getAppToken(app) {
  return getApp(app)?.token;
}

function getGroupToken({ app, group }) {
  const groups = def.listify(getApp(app)?.group);
  return groups.find(({ id }) => id == group)?.token;
}

const userToken = config?.user;
const groupToken = config?.group;

export { userToken, groupToken, getAppToken, getGroupToken };
