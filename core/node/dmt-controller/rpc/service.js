const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const definition = require('./defineService');

const serviceName = 'controller';

module.exports = { definition, serviceName };
