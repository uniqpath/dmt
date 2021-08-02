'use strict';

let expect = require('chai').expect;
let User = require('../lib/User');

describe('User', () => {
  beforeEach(() => {
    this.id = '123456789012345678901234567890';
    this.device = 'test-device';
    this.user = new User(this.id, this.device);
  });

  describe('constructor', () => {
    it('should set default properties', () => {
      expect(this.user).to.have.property('properties');
    });

    it('should set initial id', () => {
      expect(this.user.id).equal(this.id);
    });

    it('should set initial device', () => {
      expect(this.user.device).equal(this.device);
    });
  });

  describe('validateUser', () => {
    it('should not throw exception on User object', () => {
      expect(() => {
        User.validateUser(this.user);
      }).to.not.throw(Error);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        User.validateUser('invalid');
      }).to.throw(Error);
    });
  });

  describe('get/set id', () => {
    it('should set id', () => {
      let id = 'abcdefghijabcdefghijabcdefghij';
      this.user.id = id;

      expect(this.user.id).equals(id);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.user.id = 'invalid';
      }).to.throw(Error);
    });
  });

  describe('get/set device', () => {
    it('should set device', () => {
      let device = 'test-device';
      this.user.device = device;

      expect(this.user.device).equals(device);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.user.device = '.invalid.';
      }).to.throw(Error);
    });
  });
});
