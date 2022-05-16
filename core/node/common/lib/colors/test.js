import colors from './colors';

const a = { a: 1 };

console.log(colors.green().bold(a));

console.log(a);
console.log(colors.green(a));
console.log(colors.green().bold(undefined));
