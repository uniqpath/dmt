function match(line, terms) {
  if (typeof terms === 'string') {
    terms = terms.split(' ');
  }

  terms = terms.map(term => term.trim().toLowerCase());

  line = line.toLowerCase();

  for (const term of terms) {
    if (!line.includes(term)) {
      return false;
    }
  }

  return true;
}

module.exports = { match };

if (require.main === module) {
  console.log(match('a Bb c d', 'A b'));
}
