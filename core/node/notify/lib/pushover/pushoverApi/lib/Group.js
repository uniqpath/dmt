const DEFAULT_PROPERTIES = {
  id: ''
};

class Group {
  constructor(id, device) {
    this.properties = Object.assign({}, DEFAULT_PROPERTIES);
    this.id = id || DEFAULT_PROPERTIES.id;
  }

  static validateGroup(group) {
    validateGroup(group);
  }

  get id() {
    return this.properties.id;
  }

  set id(value) {
    validateId(value);

    this.properties.id = value;
  }
}

function validateGroup(value) {
  if (!(value instanceof Group)) {
    throw new Error('Expecting type Group');
  }
}

function validateId(value) {
  if (!value.match(/^[a-z0-9]{30}$/i)) {
    throw new Error('Group id must be 30 characters long and alphanumeric');
  }
}

export default Group;
