module.exports = modulo;

function modulo(n, d) {
  if (d === 0) {
    return n;
  }
  if (d < 0) {
    return NaN;
  }
  return ((n % d) + d) % d;
}
