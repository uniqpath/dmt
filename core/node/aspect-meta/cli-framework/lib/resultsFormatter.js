import colors from 'colors';

import fs from 'fs';
import { homedir } from 'os';

export default function resultsFormatter(results) {
  results.forEach((result, index) => {
    process.stdout.write(`${colors.green(index + 1)}. `);
    console.log(`${result.filePathANSI} [${colors.cyan(result.fileSizePretty)}]`);

    const devMachine = fs.existsSync(`${homedir()}/.dmt/user/devices/this/.dev-machine`);

    if (result.fiberContentURL && devMachine) {
      console.log(`🔗 ${colors.gray(result.fiberContentURL)}`);
      console.log();
    }
  });
}
