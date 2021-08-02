'use strict';

let expect = require('chai').expect;
let Sound = require('../lib/Sound');

describe('Sound', () => {
  beforeEach(() => {
    this.name = 'classical';
    this.sound = new Sound(this.name);
  });

  describe('constructor', () => {
    it('should set name', () => {
      expect(this.sound).to.have.property('name');
    });

    it('should set description', () => {
      expect(this.sound).to.have.property('description');
    });

    it('should throw exception on invalid name', () => {
      expect(() => {
        new Sound('invalid');
      }).to.throw(Error);
    });
  });

  describe('validateSound', () => {
    it('should not throw exception on Sound object', () => {
      expect(() => {
        Sound.validateSound(this.sound);
      }).to.not.throw(Error);
    });

    it('should throw exception on invalid value', () => {
      expect(() => {
        Sound.validateSound({});
      }).to.throw(Error);
    });
  });

  describe('validateSoundName', () => {
    it('should not throw exception on valid name', () => {
      expect(() => {
        Sound.validateSoundName('pushover');
      }).to.not.throw(Error);
    });

    it('should throw exception on invalid name', () => {
      expect(() => {
        Sound.validateSoundName('invalid');
      }).to.throw(Error);
    });
  });
});
