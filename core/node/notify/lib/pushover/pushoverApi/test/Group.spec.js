'use strict';

let expect = require('chai').expect;
let Group = require('../lib/Group');

describe('Group', () => {
  beforeEach(() => {
    this.group = new Group('123456789012345678901234567890');
  });

  describe('constructor', () => {
    it('should set initial properties', () => {
      expect(this.group).to.have.property('properties');
    });
  });

  describe('validateGroup', () => {
    it('should throw exception on invalid value', () => {
      expect(() => {
        Group.validateGroup('test');
      }).to.throw(Error);
    });

    it('should not throw exception on Group object', () => {
      expect(() => {
        Group.validateGroup(this.group);
      }).to.not.throw(Error);
    });
  });

  describe('get/set id', () => {
    it('should set id', () => {
      let id = '098765432109876543210987654321';
      this.group.id = id;

      expect(this.group.id).to.equal(id);
    });

    it('should throw error on invalid value', () => {
      expect(() => {
        this.group.id = 'invalid';
      }).to.throw(Error);
    });
  });
});
