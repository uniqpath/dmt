export default squash;

var escapeSequencesRegex = /\s/g;
var spacesRegex = / /g;

function squash(str, squashEscapeSequences) {
  if (squashEscapeSequences) {
    return str.replace(escapeSequencesRegex, '');
  } else {
    return str.replace(spacesRegex, '');
  }
}
