module.exports = range;

function range(start, stop, step) {
  if (start != null && typeof start != 'number') {
    throw new Error('start must be a number or null');
  }
  if (stop != null && typeof stop != 'number') {
    throw new Error('stop must be a number or null');
  }
  if (step != null && typeof step != 'number') {
    throw new Error('step must be a number or null');
  }
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (step == null) {
    step = stop > start ? 1 : -1;
  }
  var toReturn = [];
  var increasing = start < stop;
  for (; increasing ? start < stop : start > stop; start += step) {
    toReturn.push(start);
  }
  return toReturn;
}
