const def = require('./parser');
const dmtHelper = require('./dmtHelper');
const handler1 = require('./inlineHandlers/operatorFrom.js');

module.exports = (str, { cwd }) => {
  return handler1(str, { def, cwd, dmtHelper });
};
