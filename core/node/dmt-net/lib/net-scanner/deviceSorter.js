module.exports = function sort(devices) {
  return devices.sort((a, b) => {
    const identA = a.name ? a.name : a.vendor;
    const identB = b.name ? b.name : b.vendor;

    if (identA < identB) return -1;
    if (identA > identB) return 1;
    return 0;
  });
};
