const DEFAULT_PROPERTIES = {
  id: '',
  device: ''
};

class User {
  constructor(id, device) {
    this.properties = Object.assign({}, DEFAULT_PROPERTIES);
    this.id = id || DEFAULT_PROPERTIES.id;
    this.device = device || DEFAULT_PROPERTIES.device;
  }

  static validateUser(user) {
    validateUser(user);
  }

  get id() {
    return this.properties.id;
  }

  set id(value) {
    validateId(value);

    this.properties.id = value;
  }

  get device() {
    return this.properties.device;
  }

  set device(value) {
    validateDevice(value);

    this.properties.device = value;
  }
}

function validateId(value) {
  if (!value.match(/^([a-z0-9]{30})(,[a-z0-9]{30})*$/i)) {
    throw new Error('User id must be a 30 character alphanumeric string or a comma-separated list of such ids');
  }
}

function validateDevice(value) {
  if (!value.match(/^[a-z0-9-]{0,25}$/i)) {
    throw new Error('Device name must be no longer than 25 characters long and alphanumeric');
  }
}

function validateUser(value) {
  if (!(value instanceof User)) {
    throw new Error('Expecting type User');
  }
}

export default User;
