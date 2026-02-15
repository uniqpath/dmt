'use strict';

let expect = require('chai').expect;
let Client = require('../lib/Client');
let Transport = require('../lib/Transport');

describe('Client', () => {
  beforeEach(() => {
    this.client = new Client('abcde12345abcde12345abcde12345');
  });

  describe('constructor', () => {
    it('should have options', () => {
      expect(this.client).to.have.property('options');
    });

    it('should have app counts', () => {
      expect(this.client).to.have.property('app');
    });

    it('should set apiToken', () => {
      expect(this.client).to.have.property('apiToken');
    });
  });

  describe('get/set apiToken', () => {
    it('should set apiToken', () => {
      let apiToken = '12345abcde12345abcde12345abcde';
      this.client.apiToken = apiToken;

      expect(this.client.apiToken).to.equal(apiToken);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        this.client.apiToken = 'invalid';
      }).to.throw(Error);
    });
  });

  describe('getTransport', () => {
    it('should return Transport object', () => {
      expect(this.client.getTransport()).to.be.an.instanceof(Transport);
    });

    it('should return the same Transport object on subsequent calls', () => {
      let transport = this.client.getTransport();

      expect(this.client.getTransport()).to.equal(transport);
    });
  });

  describe('get appLimit', () => {
    it('should return app limit', () => {
      let limit = 50;
      this.client.app.limit = limit;

      expect(this.client.appLimit).to.equal(limit);
    });
  });

  describe('get appRemaining', () => {
    it('should return app remaining', () => {
      let remaining = 100;
      this.client.app.remaining = remaining;

      expect(this.client.appRemaining).to.equal(remaining);
    });
  });

  describe('get appReset', () => {
    it('should return app remaining', () => {
      let reset = 1234567890;
      this.client.app.reset = reset;

      expect(this.client.appReset).to.equal(reset);
    });
  });
});
