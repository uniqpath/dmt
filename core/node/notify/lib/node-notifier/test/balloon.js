const Notify = require('../notifiers/balloon');
const utils = require('../lib/utils');
const os = require('os');

describe('WindowsBalloon', function() {
  const original = utils.immediateFileCommand;
  const originalType = os.type;
  const originalArch = os.arch;

  beforeEach(function() {
    os.type = function() {
      return 'Windows_NT';
    };
  });

  afterEach(function() {
    utils.immediateFileCommand = original;
    os.type = originalType;
    os.arch = originalArch;
  });

  function expectArgsListToBe(expected, done) {
    utils.immediateFileCommand = function(notifier, argsList, callback) {
      expect(argsList).toEqual(expected);
      done();
    };
  }

  it('should use 64 bit notifu', function(done) {
    os.arch = function() {
      return 'x64';
    };
    const expected = 'notifu64.exe';
    utils.immediateFileCommand = function(notifier, argsList, callback) {
      expect(notifier).toEndWith(expected);
      done();
    };

    new Notify().notify({ title: 'title', message: 'body' });
  });

  it('should use 32 bit notifu if 32 arch', function(done) {
    os.arch = function() {
      return 'ia32';
    };
    const expected = 'notifu.exe';
    utils.immediateFileCommand = function(notifier, argsList, callback) {
      expect(notifier).toEndWith(expected);
      done();
    };
    new Notify().notify({ title: 'title', message: 'body' });
  });

  it('should pass on title and body', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-q'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ title: 'title', message: 'body' });
  });

  it('should pass have default title', function(done) {
    const expected = ['-m', 'body', '-q', '-p', 'Node Notification:'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ message: 'body' });
  });

  it('should throw error if no message is passed', function(done) {
    utils.immediateFileCommand = function(notifier, argsList, callback) {
      expect(argsList).toBeUndefined();
    };
    new Notify().notify({}, function(err) {
      expect(err.message).toBe('Message is required.');
      done();
    });
  });

  it('should escape message input', function(done) {
    const expected = ['-m', 'some "me\'ss`age`"', '-q', '-p', 'Node Notification:'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ message: 'some "me\'ss`age`"' });
  });

  it('should be able to deactivate silent mode', function(done) {
    const expected = ['-m', 'body', '-p', 'Node Notification:'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ message: 'body', sound: true });
  });

  it('should be able to deactivate silent mode, by doing quiet false', function(done) {
    const expected = ['-m', 'body', '-p', 'Node Notification:'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ message: 'body', quiet: false });
  });

  it('should send set time', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-d', '1000', '-q'];

    expectArgsListToBe(expected, done);
    new Notify().notify({ title: 'title', message: 'body', time: '1000' });
  });

  it('should not send false flags', function(done) {
    const expected = ['-d', '1000', '-i', 'icon', '-m', 'body', '-p', 'title', '-q'];

    expectArgsListToBe(expected, done);
    new Notify().notify({
      title: 'title',
      message: 'body',
      d: '1000',
      icon: 'icon',
      w: false
    });
  });

  it('should send additional parameters as --"keyname"', function(done) {
    const expected = ['-d', '1000', '-w', '-i', 'icon', '-m', 'body', '-p', 'title', '-q'];

    expectArgsListToBe(expected, done);
    new Notify().notify({
      title: 'title',
      message: 'body',
      d: '1000',
      icon: 'icon',
      w: true
    });
  });

  it('should remove extra options that are not supported by notifu', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-q'];
    expectArgsListToBe(expected, done);
    new Notify().notify({
      title: 'title',
      message: 'body',
      tullball: 'notValid'
    });
  });

  it('should have both type and duration options', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-q', '-d', '10', '-t', 'info'];

    expectArgsListToBe(expected, done);
    new Notify().notify({
      title: 'title',
      message: 'body',
      type: 'info',
      t: 10
    });
  });

  it('should sanitize wrong string type option to info', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-q', '-t', 'info'];

    expectArgsListToBe(expected, done);
    new Notify().notify({
      title: 'title',
      message: 'body',
      type: 'theansweris42'
    });
  });

  it('should sanitize type option to error', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-q', '-t', 'error'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ title: 'title', message: 'body', type: 'ErRoR' });
  });

  it('should sanitize wring integer type option to info', function(done) {
    const expected = ['-m', 'body', '-p', 'title', '-q', '-t', 'info'];
    expectArgsListToBe(expected, done);
    new Notify().notify({ title: 'title', message: 'body', type: 42 });
  });
});
