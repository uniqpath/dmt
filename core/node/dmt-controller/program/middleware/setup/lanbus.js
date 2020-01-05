module.exports = (program, { bus }) => {
  program.emit('lanbus:ready', bus);
};
