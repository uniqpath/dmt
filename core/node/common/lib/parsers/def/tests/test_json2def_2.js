import { def } from 'dmt/common';

console.log(def.parse('key: value'));

console.log('Original def:');
console.log(def.fromJson({ key: [{ id: 'value' }] }));
