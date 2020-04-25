export default (program, { bus }) => {
  program.emit('lanbus:ready', bus);
};
