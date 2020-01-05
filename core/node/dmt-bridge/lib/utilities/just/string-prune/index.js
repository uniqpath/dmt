module.exports = prune;

function prune(str, length, end) {
  if (length == null || length >= str.length) {
    return str;
  }
  if (end == null) {
    end = '...';
  }
  var remnantPlusOne = str.slice(0, Math.max(0, length - end.length) + 1);
  var lastSpace = Math.max(0, remnantPlusOne.lastIndexOf(' '));
  return remnantPlusOne.slice(0, lastSpace) + end;
}
