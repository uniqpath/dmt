module.exports = function deviceFilter(term, devices) {
  return devices.filter(device => {
    const hidden = term == '--hidden' ? true : !device.hidden;
    return term && term != '--hidden' ? device.name && device.name.toLowerCase().indexOf(term.toLowerCase()) > -1 : hidden;
  });
};
