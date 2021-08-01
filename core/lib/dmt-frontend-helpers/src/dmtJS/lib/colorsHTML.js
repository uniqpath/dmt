function wrap(text, color) {
  return `<span style="color: ${color};">${text}</span>`;
}

function white(text) {
  return wrap(text, 'white');
}

function red(text) {
  return wrap(text, '#E34042');
}

function green(text) {
  return wrap(text, '#5FE02A');
}

function gray(text) {
  return wrap(text, '#C3C6C6');
}

function yellow(text) {
  return wrap(text, '#E5AE34');
}

function cyan(text) {
  return wrap(text, '#29B3BF');
}

function magenta(text) {
  return wrap(text, '#A144E9');
}

export default { white, red, green, gray, yellow, cyan, magenta };
