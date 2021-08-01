'use strict';

let expect = require('chai').expect;
let Message = require('../lib/Message');
let Priority = require('../lib/Priority');
let Sound = require('../lib/Sound');
let User = require('../lib/User');
let Group = require('../lib/Group');
let _ = require('lodash');

describe('Message', () => {
  beforeEach(() => {
    this.message = new Message();
  });

  describe('constructor', () => {
    it('should set initial properties', () => {
      let options = {
        message: 'Test msg',
        enableHtml: true
      };

      this.message = new Message(options);

      expect(this.message).to.have.property('message');
      expect(this.message.message).to.equal(options.message);

      expect(this.message).to.have.property('enableHtml');
      expect(this.message.enableHtml).to.equal(1);
    });
  });

  describe('validateMessage', () => {
    it('should throw exception on invalid value', () => {
      expect(() => {
        Message.validateMessage('invalid');
      }).to.throw(Error);
    });

    it('should not throw exception on Message object', () => {
      expect(() => {
        Message.validateMessage(this.message);
      }).to.not.throw(Error);
    });
  });

  describe('get/set message', () => {
    it('should set message', () => {
      let message = 'Test message';
      this.message.message = message;

      expect(this.message.message).to.equal(message);
    });
  });

  describe('get/set enableHtml', () => {
    it('should set enableHtml', () => {
      let enableHtml = false;
      this.message.enableHtml = enableHtml;

      expect(this.message.enableHtml).to.equal(0);
    });
  });

  describe('get/set user', () => {
    it('should set user', () => {
      let user = new User('123456789012345678901234567890');
      this.message.user = user;

      expect(this.message.user).to.equal(user);
    });

    it('should set group', () => {
      let group = new Group('123456789012345678901234567890');
      this.message.user = group;

      expect(this.message.user).to.equal(group);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.message.user = 'invalid';
      }).to.throw(Error);
    });
  });

  describe('get/set title', () => {
    it('should set title', () => {
      let title = 'Test title';
      this.message.title = title;

      expect(this.message.title).to.equal(title);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.message.title = _.repeat('*', 101);
      }).to.throw(Error);
    });
  });

  describe('get/set url', () => {
    it('should set url', () => {
      let url = 'Test URL';
      this.message.url = url;

      expect(this.message.url).to.equal(url);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.message.url = _.repeat('*', 501);
      }).to.throw(Error);
    });
  });

  describe('get/set urlTitle', () => {
    it('should set urlTitle', () => {
      let urlTitle = 'Test URL title';
      this.message.urlTitle = urlTitle;

      expect(this.message.urlTitle).to.equal(urlTitle);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.message.urlTitle = _.repeat('*', 51);
      }).to.throw(Error);
    });
  });

  describe('get/set priority', () => {
    it('should set priority', () => {
      let priority = new Priority('normal');
      this.message.priority = priority;

      expect(this.message.priority).to.equal(priority);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.message.priority = 'invalid';
      }).to.throw(Error);
    });
  });

  describe('get/set timestamp', () => {
    it('should set timestamp', () => {
      let timestamp = 123456;
      this.message.timestamp = timestamp;

      expect(this.message.timestamp).to.equal(timestamp);
    });
  });

  describe('get/set sound', () => {
    it('should set sound', () => {
      let sound = new Sound('pushover');
      this.message.sound = sound;

      expect(this.message.sound).to.equal(sound);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.message.sound = 'invalid';
      }).to.throw(Error);
    });
  });
});
