const commands = {
  getProperty(property) {
    return this.ipc.getProperty(property);
  },
  setProperty(property, value) {
    return this.ipc.setProperty(property, value);
  },
  setMultipleProperties(properties) {
    Object.keys(properties).forEach(
      function(property) {
        this.ipc.setProperty(property, properties[property]);
      }.bind(this)
    );
  },
  addProperty(property, value) {
    return this.ipc.addProperty(property, value);
  },
  multiplyProperty(property, value) {
    return this.ipc.multiplyProperty(property, value);
  },
  cycleProperty(property) {
    return this.ipc.cycleProperty(property);
  },
  command(command, args) {
    return this.ipc.command(command, args);
  },
  freeCommand(command) {
    this.ipc.freeCommand(command);
  },

  observeProperty(property, id) {
    this.observed[property] = null;
    this.observedIDs[id] = property;
    this.ipc.command('observe_property', [id, property]);
  },
  unobserveProperty(id) {
    delete this.observed[this.observedIDs[id]];
    delete this.observedIDs[id];
    this.ipc.command('unobserve_property', [id]);
  }
};

export default commands;
