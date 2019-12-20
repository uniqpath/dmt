const def = require('./parser');

const example = `
country: tuva
  population: 2000
`;

console.log(def.parse({ str: example }));

console.log('\nA:');

const a = def.parse({
  str: `
network: home
  ip: 192.168.0.20
`
});

console.log(def.values(a.network));

console.log('\nB:');

const b = def.parse({
  str: `
network: home
`
});

console.log(def.values(b.network));

console.log('\nC:');

const c = def.parse({
  str: `
network: home
network: work
  ip: 192.168.0.30
`
});

console.log(def.values(c.network));
