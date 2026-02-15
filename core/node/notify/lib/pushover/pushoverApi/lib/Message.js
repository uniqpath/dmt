const DEFAULT_PROPERTIES = {
  message: null,
  enableHtml: 0,
  user: null,
  url: null,
  urlTitle: null,
  priority: 0,
  timestamp: null,
  sound: 'none'
};

class Message {
  constructor(options) {
    this.properties = Object.assign({}, DEFAULT_PROPERTIES);

    for (let i in options) {
      if (options[i] != null) {
        this[i] = options[i];
      }
    }
  }

  get message() {
    return this.properties.message;
  }

  set message(value) {
    this.properties.message = value;
  }

  get enableHtml() {
    return this.properties.enableHtml;
  }

  set enableHtml(value) {
    this.properties.enableHtml = value ? 1 : 0;
  }

  get user() {
    return this.properties.user;
  }

  set user(value) {
    this.properties.user = value;
  }

  get title() {
    return this.properties.title;
  }

  set title(value) {
    validateTitle(value);

    this.properties.title = value;
  }

  get url() {
    return this.properties.url;
  }

  set url(value) {
    validateUrl(value);

    this.properties.url = value;
  }

  get urlTitle() {
    return this.properties.urlTitle;
  }

  set urlTitle(value) {
    if (value?.length > 50) {
      this.properties.urlTitle = `${value.substr(0, 49)}…`;
    } else {
      this.properties.urlTitle = value;
    }
  }

  get priority() {
    return this.properties.priority;
  }

  set priority(value) {
    this.properties.priority = value;
  }

  get timestamp() {
    return this.properties.timestamp;
  }

  set timestamp(value) {
    this.properties.timestamp = parseInt(value);
  }

  get sound() {
    return this.properties.sound;
  }

  set sound(value) {
    this.properties.sound = value;
  }
}

function validateTitle(value) {
  if (value.length > 100) {
    throw new Error('Title may not exceed 100 characters');
  }
}

function validateUrl(value) {
  if (value.length > 500) {
    throw new Error('URL may not exceed 500 characters');
  }
}

function validateUrlTitle(value) {
  if (value.length > 50) {
    throw new Error('URL title may not exceed 50 characters');
  }
}

export default Message;
