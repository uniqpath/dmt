'use strict';

let expect = require('chai').expect;
let Priority = require('../lib/Priority');

describe('Priority', () => {
  describe('constructor', () => {
    it('should set properties', () => {
      let priority = new Priority('normal');

      expect(priority).to.have.property('properties');
    });

    it('should set additional properties for emergency', () => {
      let priority = new Priority('emergency');

      expect(priority.properties).to.have.property('retry');
    });

    it('should set emergency options', () => {
      let options = {
        retry: 90,
        expire: 60
      };

      let priority = new Priority('emergency', options);

      expect(priority.retry).to.equal(options.retry);
      expect(priority.expire).to.equal(options.expire);
    });

    it('should throw exception on invalid priority name', () => {
      expect(() => {
        new Priority('invalid');
      }).to.throw(Error);
    });
  });

  describe('validatePriority', () => {
    it('should throw exception on invalid value', () => {
      expect(() => {
        Priority.validatePriority('invalid');
      }).to.throw(Error);
    });

    it('should not throw exception on Priority object', () => {
      expect(() => {
        Priority.validatePriority(new Priority('normal'));
      }).to.not.throw(Error);
    });
  });
});

describe('EmergencyPriority', () => {
  beforeEach(() => {
    this.priority = new Priority('emergency');
  });

  describe('get/set retry', () => {
    it('should set retry', () => {
      let retry = 30;
      this.priority.retry = retry;

      expect(this.priority.retry).to.equal(retry);
    });

    it('should throw exception on invalid retry', () => {
      expect(() => {
        this.priority.retry = 29;
      }).to.throw(Error);
    });
  });

  describe('get/set expire', () => {
    it('should set expire', () => {
      let expire = 3600;
      this.priority.expire = expire;

      expect(this.priority.expire).to.equal(expire);
    });

    it('should throw exception on invalid expire', () => {
      expect(() => {
        this.priority.expire = 86401;
      }).to.throw(Error);
    });
  });
});
