const constructAction = ({ action, storeName, payload }) => {
  const data = {
    action,
    storeName,
    payload
  };

  return JSON.stringify(data);
};

module.exports = constructAction;
