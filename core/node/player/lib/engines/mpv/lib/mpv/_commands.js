const commands = {
  getProperty(property) {
    return this.socket.getProperty(property);
  },
  setProperty(property, value) {
    return this.socket.setProperty(property, value);
  },
  setMultipleProperties(properties) {
    Object.keys(properties).forEach(
      function(property) {
        this.socket.setProperty(property, properties[property]);
      }.bind(this)
    );
  },
  addProperty(property, value) {
    return this.socket.addProperty(property, value);
  },
  multiplyProperty(property, value) {
    return this.socket.multiplyProperty(property, value);
  },
  cycleProperty(property) {
    return this.socket.cycleProperty(property);
  },
  command(command, args) {
    return this.socket.command(command, args);
  },
  freeCommand(command) {
    this.socket.freeCommand(command);
  },

  observeProperty(property, id) {
    this.observed[property] = null;
    this.observedIDs[id] = property;
    this.socket.command('observe_property', [id, property]);
  },
  unobserveProperty(id) {
    delete this.observed[this.observedIDs[id]];
    delete this.observedIDs[id];
    this.socket.command('unobserve_property', [id]);
  }
};

export default commands;
