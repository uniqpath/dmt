'use strict';

let chai = require('chai');
let expect = require('chai').expect;
let chaiAsPromised = require('chai-as-promised');
let mockery = require('mockery');
let sinon = require('sinon');

chai.use(chaiAsPromised);

describe('Transport', () => {
  let requestStub, Transport;

  beforeEach(() => {
    this.clientStub = sinon.stub();
    this.clientStub.options = {
      host: 'http://example.org',
      version: '1'
    };
    this.clientStub.app = {};

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    requestStub = sinon.stub();

    mockery.registerMock('request', requestStub);

    Transport = require('../lib/Transport');

    this.transport = new Transport(this.clientStub);
  });

  describe('constructor', () => {
    it('should set client', () => {
      expect(this.transport).has.property('client');
    });
  });

  describe('sendRequest', () => {
    it('should return a Promise', () => {
      expect(this.transport.sendRequest()).to.be.an.instanceof(Promise);
    });

    it('should reject on request error', () => {
      requestStub.yields('general error', null, null);

      return expect(this.transport.sendRequest()).eventually.be.rejectedWith(Error);
    });

    it('should reject on request status other than 200', () => {
      requestStub.yields(null, { statusCode: 500 }, null);

      return expect(this.transport.sendRequest()).eventually.be.rejectedWith(Error);
    });

    it('should resolve on request success', () => {
      requestStub.yields(
        null,
        {
          statusCode: 200,
          headers: {
            'x-limit-app-limit': 5000,
            'x-limit-app-remaining': 5000,
            'x-limit-app-reset': 123
          }
        },
        '{}'
      );

      return expect(this.transport.sendRequest()).eventually.be.fulfilled;
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });
});
