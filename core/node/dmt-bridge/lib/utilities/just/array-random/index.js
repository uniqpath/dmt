module.exports = random;

function random(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
