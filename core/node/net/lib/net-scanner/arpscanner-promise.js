import scanner from './arpscanner.js';

export default arpScanner;

function arpScanner(options) {
  return new Promise((resolve, reject) => {
    scanner((err, out) => (err ? reject(err) : resolve(out)), options);
  });
}
