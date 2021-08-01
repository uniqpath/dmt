'use strict';

let expect = require('chai').expect;
let Receipt = require('../lib/Receipt');

describe('Receipt', () => {
  beforeEach(() => {
    this.stubId = '1234567890';
    this.stubResult = {
      acknowledged: true,
      acknowledged_at: 1234,
      acknowledged_by: '1234567890',
      last_delivered_at: 1234,
      expired: true,
      expires_at: 12345678,
      called_back: true,
      called_back_at: 23455678
    };

    this.receipt = new Receipt(this.stubId, this.stubResult);
  });

  describe('constructor', () => {
    it('should set id', () => {
      expect(this.receipt).to.have.property('id');
    });

    it('should set properties', () => {
      expect(this.receipt).to.have.property('properties');
    });

    it('should convert properties to camelCase', () => {
      expect(this.receipt.properties).to.have.property('calledBackAt');

      expect(this.receipt.properties.calledBackAt).to.equal(this.stubResult.called_back_at);
    });
  });

  describe('get id', () => {
    it('should equal initial value', () => {
      expect(this.receipt.id).to.equal(this.stubId);
    });
  });

  describe('get isAcknowledged', () => {
    it('should equal initial value', () => {
      expect(this.receipt.isAcknowledged).to.equal(this.stubResult.acknowledged);
    });
  });

  describe('set acknowledged', () => {
    it('should set acknowledged', () => {
      let isAcknowledged = false;
      this.receipt.acknowledged = isAcknowledged;

      expect(this.receipt.isAcknowledged).to.equal(isAcknowledged);
    });
  });

  describe('get/set acknowledgedAt', () => {
    it('should set acknowledgedAt', () => {
      let acknowledgedAt = 123456;
      this.receipt.acknowledgedAt = acknowledgedAt;

      expect(this.receipt.acknowledgedAt).to.equal(acknowledgedAt);
    });
  });

  describe('get/set acknowledgedBy', () => {
    it('should set acknowledgedBy', () => {
      let acknowledgedBy = '67890';
      this.receipt.acknowledgedBy = acknowledgedBy;

      expect(this.receipt.acknowledgedBy).to.equal(acknowledgedBy);
    });
  });

  describe('get/set lastDeliveredAt', () => {
    it('should set lastDeliveredAt', () => {
      let lastDeliveredAt = 123456;
      this.receipt.lastDeliveredAt = lastDeliveredAt;

      expect(this.receipt.lastDeliveredAt).to.equal(lastDeliveredAt);
    });
  });

  describe('get isExpired', () => {
    it('should equal initial value', () => {
      expect(this.receipt.isExpired).to.equal(this.stubResult.expired);
    });
  });

  describe('set expired', () => {
    it('should set expired', () => {
      let isExpired = false;
      this.receipt.expired = isExpired;

      expect(this.receipt.isExpired).to.equal(isExpired);
    });
  });

  describe('get/set expiresAt', () => {
    it('should set expiresAt', () => {
      let expiresAt = 123456;
      this.receipt.expiresAt = expiresAt;

      expect(this.receipt.expiresAt).to.equal(expiresAt);
    });
  });

  describe('get hasCalledBack', () => {
    it('should equal initial value', () => {
      expect(this.receipt.hasCalledBack).to.equal(this.stubResult.called_back);
    });
  });

  describe('set calledBack', () => {
    it('should set calledBack', () => {
      let hasCalledBack = false;
      this.receipt.calledBack = hasCalledBack;

      expect(this.receipt.hasCalledBack).to.equal(hasCalledBack);
    });
  });

  describe('get/set calledBackAt', () => {
    it('should set calledBackAt', () => {
      let calledBackAt = 123456;
      this.receipt.calledBackAt = calledBackAt;

      expect(this.receipt.calledBackAt).to.equal(calledBackAt);
    });
  });
});
