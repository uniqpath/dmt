const PRIORITY_SET = {
  emergency: 2,
  high: 1,
  normal: 0,
  low: -1,
  lowest: -2
};

const DEFAULT_EMERGENCY_PROPERTIES = {
  retry: 30,
  expire: 86400,
  callback: null
};

class Priority {
  constructor(name, options) {
    if (name == 'emergency' && !(this instanceof EmergencyPriority)) {
      return new EmergencyPriority(name, options);
    }

    this.properties = {};
    this.name = name;
  }

  static validatePriority(value) {
    validatePriority(value);
  }

  get name() {
    return this.priorityName;
  }

  set name(name) {
    validatePriorityName(name);

    this.priorityName = name;
    this.properties.priority = PRIORITY_SET[name];
  }
}

class EmergencyPriority extends Priority {
  constructor(name, options) {
    super(name);

    options = { ...DEFAULT_EMERGENCY_PROPERTIES, ...Object(options) };
    for (let i in options) {
      this[i] = options[i];
    }
  }

  get retry() {
    return this.properties.retry;
  }

  set retry(value) {
    validateRetry(value);

    this.properties.retry = value;
  }

  get expire() {
    return this.properties.expire;
  }

  set expire(value) {
    validateExpire(value);

    this.properties.expire = value;
  }

  get callback() {
    return this.properties.callback;
  }

  set callback(value) {
    this.properties.callback = value;
  }
}

function validatePriority(value) {
  if (!(value instanceof Priority)) {
    throw new Error('Expecting type Priority');
  }
}

function validatePriorityName(name) {
  if (!PRIORITY_SET[name]) {
    throw new Error(`Priority name ${name} not valid`);
  }
}

function validateRetry(value) {
  if (value < 30) {
    throw new Error('Retry must be a minimum of 30 seconds');
  }
}

function validateExpire(value) {
  if (value > 86400) {
    throw new Error('Expire must not exceed 24 hours');
  }
}

export default Priority;
