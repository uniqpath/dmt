import should from 'should';
import ipc from './ipc.js';
import qbus from 'qbus';

const address = {
  tcp: { host: '127.0.0.1', port: 31338 },
  socket: { path: '/tmp/crdtest.sock' }
};

describe('Listening ...', function() {
  it('on tcp should not throw', function(done) {
    (function() {
      var server = new ipc();
      server.listen(address.tcp, e => {
        if (e) throw e;
        server.close(done);
      });
    }.should.not.throw());
  });

  it('on sockets should not throw', function(done) {
    (function() {
      var server = new ipc();
      server.listen(address.socket, e => {
        if (e) throw e;
        server.close(done);
      });
    }.should.not.throw());
  });
});

describe('Connecting ...', function() {
  it('to tcp should not throw', function(done) {
    (function() {
      var server = new ipc();
      server.listen(address.tcp, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.connect(address.tcp, e2 => {
          if (e2) throw e2;
          client.close();
          server.close(done);
        });
      });
    }.should.not.throw());
  });

  it('to socket should not throw', function(done) {
    (function() {
      var server = new ipc();
      server.listen(address.socket, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.connect(address.socket, e2 => {
          if (e2) throw e2;
          client.close();
          server.close(done);
        });
      });
    }.should.not.throw());
  });
});

describe('Connecting to non existing server ...', function() {
  it('with tcp should throw error', function(done) {
    (function() {
      var client = new ipc();
      client.connect({ host: 'asdf', port: 1234, timeout: 500 }, e => {
        if (e) {
          done();
        }
      });
    }.should.not.throw());
  });

  it('with socket should throw error', function(done) {
    (function() {
      var client = new ipc();
      client.connect({ path: '/tmp/__lol-asdf-not-existing', timeout: 500 }, e => {
        if (e) {
          done();
        }
      });
    }.should.not.throw());
  });
});

describe('Reconnecting ...', function() {
  it('with tcp should not throw', function(done) {
    this.timeout(15000);

    (function() {
      var client = new ipc();
      client.connect({ host: '127.0.0.1', port: 51234, timeout: 500, reconnect: 500 }, e => {
        if (!e) {
          done();
        }
      });

      var server = new ipc();
      server.listen({ host: '127.0.0.1', port: 51234 }, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.connect(address.socket, e2 => {
          if (e2) throw e2;
          client.close();
          server.close(done);
        });
      });
    }.should.not.throw());
  });
});

describe('One way communication (qbus)...', function() {
  it('over tcp should complete and not throw', function(done) {
    (function() {
      var server = new ipc();
      server.use(qbus);
      server.listen(address.tcp, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.use(qbus);
        client.connect(address.tcp, e2 => {
          if (e2) throw e2;
          client.emit('/test/send', 'I am payload');
          client.close();
        });
        client.on('error', e => {
          throw e;
        });
      });
      server.on('/test/:what', function(what, payload) {
        if (what === 'send' && payload == 'I am payload') {
          server.close(done);
        }
      });
      server.on('error', e => {
        throw e;
      });
    }.should.not.throw());
  });

  it('over sockets should complete and not throw', function(done) {
    (function() {
      var server = new ipc();
      server.use(qbus);
      server.listen(address.socket, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.use(qbus);
        client.connect(address.socket, e2 => {
          if (e2) throw e2;
          client.emit('/test/send', 'I am payload');
          client.close();
        });
        client.on('error', e => {
          throw e;
        });
      });
      server.on('/test/:what', function(what, payload) {
        if (what === 'send' && payload == 'I am payload') {
          server.close(done);
        }
      });
      server.on('error', e => {
        throw e;
      });
    }.should.not.throw());
  });
});

describe('Two way communication (qbus) ...', function() {
  it('over tcp should complete and not throw', function(done) {
    (function() {
      var server = new ipc();
      server.use(qbus);
      server.listen(address.tcp, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.use(qbus);
        client.connect(address.tcp, e2 => {
          if (e2) throw e2;
          client.emit('/test/send', 'I am payload');
          client.on('/test/:what?', function(what) {
            if (what === 'response') {
              client.close();
              server.close(done);
            }
          });
        });
        client.on('error', e => {
          throw e;
        });
      });
      server.on('/test/:what', function(what, payload) {
        if (what === 'send' && payload == 'I am payload') {
          server.emit('/test/response');
        }
      });
      server.on('error', e => {
        throw e;
      });
    }.should.not.throw());
  });

  it('over sockets should complete and not throw', function(done) {
    (function() {
      var server = new ipc();
      server.use(qbus);
      server.listen(address.socket, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.use(qbus);
        client.connect(address.socket, e2 => {
          if (e2) throw e2;
          client.emit('/test/send', 'I am payload');
          client.on('/test/:what?', function(what) {
            if (what === 'response') {
              client.close();
              server.close(done);
            }
          });
        });
        client.on('error', e => {
          throw e;
        });
      });
      server.on('/test/:what', function(what, payload) {
        if (what === 'send' && payload == 'I am payload') {
          server.emit('/test/response');
        }
      });
      server.on('error', e => {
        throw e;
      });
    }.should.not.throw());
  });
});

describe('Two way communication (EventEmitter) ...', function() {
  it('over tcp should complete and not throw', function(done) {
    (function() {
      var server = new ipc();
      server.listen(address.tcp, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.connect(address.tcp, e2 => {
          if (e2) throw e2;
          client.emit('/test/send', 'I am payload');
          client.on('/test/reply', function() {
            client.close();
            server.close(done);
          });
        });
        client.on('error', e => {
          throw e;
        });
      });
      server.on('/test/send', function(payload) {
        if (payload == 'I am payload') {
          server.emit('/test/reply');
        }
      });
      server.on('error', e => {
        throw e;
      });
    }.should.not.throw());
  });

  it('over sockets should complete and not throw', function(done) {
    (function() {
      var server = new ipc();
      server.listen(address.socket, e1 => {
        if (e1) throw e1;
        var client = new ipc();
        client.connect(address.socket, e2 => {
          if (e2) throw e2;
          client.emit('/test/send', 'I am payload');
          client.on('/test/reply', function() {
            client.close();
            server.close(done);
          });
        });
        client.on('error', e => {
          throw e;
        });
      });
      server.on('/test/send', function(payload) {
        if (payload == 'I am payload') {
          server.emit('/test/reply');
        }
      });
      server.on('error', e => {
        throw e;
      });
    }.should.not.throw());
  });
});
