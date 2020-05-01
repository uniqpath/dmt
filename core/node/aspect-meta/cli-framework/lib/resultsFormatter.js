import colors from 'colors';

import fs from 'fs';
import { homedir } from 'os';

export default function resultsFormatter(results) {
  const devMachine = fs.existsSync(`${homedir()}/.dmt/user/devices/this/.dev-machine`);

  results.forEach((result, index) => {
    process.stdout.write(`${colors.green(index + 1)}. `);
    if (result.filePath) {
      console.log(`${result.filePathANSI} [${colors.cyan(result.fileSizePretty)}]`);
    } else if (result.swarmBzzHash) {
      console.log(`${colors.gray('[SWARM]')} ${result.name} (${result.context}) [${colors.gray(result.swarmBzzHash)}]`);
    }

    if (result.playableUrl && devMachine) {
      console.log(`🔗 ${colors.gray(result.playableUrl)}`);
      console.log();
    }
  });
}
