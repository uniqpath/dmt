import fingerprint from './lib/fingerprint';
import pad from './lib/pad';

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock() {
  return pad(((Math.random() * discreteValues) << 0).toString(base), blockSize);
}

function safeCounter() {
  c = c < discreteValues ? c : 0;
  c++;
  return c - 1;
}

function cuid() {
  var letter = 'c',
    timestamp = new Date().getTime().toString(base),
    counter = pad(safeCounter().toString(base), blockSize),
    print = fingerprint(),
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug() {
  var date = new Date().getTime().toString(36),
    counter = safeCounter()
      .toString(36)
      .slice(-4),
    print = fingerprint().slice(0, 1) + fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) + counter + print + random;
};

cuid.fingerprint = fingerprint;

export default cuid;
