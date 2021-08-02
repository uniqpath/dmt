import dmt from 'dmt/common';

const { def } = dmt;

console.log(def.parse('key: value'));

console.log('Original def:');
console.log(def.fromJson({ key: [{ id: 'value' }] }));
