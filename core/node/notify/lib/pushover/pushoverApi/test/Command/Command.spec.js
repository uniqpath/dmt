'use strict';

let expect = require('chai').expect;
let Command = require('../../lib/Command/Command');

describe('Command/Command', () => {
  beforeEach(() => {
    this.command = new Command();
  });

  describe('invoke', () => {
    it('should throw error', () => {
      expect(() => {
        this.command.invoke();
      }).to.throw(Error);
    });
  });
});
