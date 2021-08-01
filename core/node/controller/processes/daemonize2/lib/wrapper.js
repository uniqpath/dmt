import * as constants from './constants.js';

let exceptionHandler = null;

process.on(
  'uncaughtException',
  (exceptionHandler = function(err) {
    process.send({ type: 'error', error: err.stack || err.message });
    process.disconnect();
    process.exit(1);
  })
);

process.on('message', message => {
  if (message.type == 'init') {
    init(message.options);
  }
});

process.send({ type: 'wrapper_loaded' });

function init(options) {
  if (!options.main) {
    process.exit(constants.exitCodes.argMainRequired[0]);
  }

  if (options.name) process.title = options.name;

  process.umask(options.umask);

  try {
    process.chdir(options.cwd || '/');
  } catch (ex) {
    process.exit(constants.exitCodes.chdirFailed[0]);
  }

  if (options.group) {
    try {
      process.setgid(options.group);
    } catch (ex) {
      process.exit(ex.code == 'EPERM' ? constants.exitCodes.setgidNoPriv[0] : constants.exitCodes.setgidFailed[0]);
    }
  }

  if (options.user) {
    try {
      process.setuid(options.user);
    } catch (ex) {
      process.exit(ex.code == 'EPERM' ? constants.exitCodes.setuidNoPriv[0] : constants.exitCodes.setuidFailed[0]);
    }
  }

  process.argv = [process.argv[0], options.main].concat(process.argv.slice(2));

  import(options.main).then(module => {
    const setup = module.default;
    if (typeof setup == 'function') setup(options);
  });

  process.removeListener('uncaughtException', exceptionHandler);

  process.disconnect();
}
