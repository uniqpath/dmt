// it doesn't do much just edits package.json
const fs = require('fs');

if (fs.existsSync('package.json')) {
  let packagejson = fs.readFileSync('package.json', 'utf-8');
  packagejson = JSON.parse(packagejson);
  packagejson['scripts']['dmt-install'] = 'chmod +x dmt/dmt-install && ./dmt/dmt-install';
  fs.writeFileSync('package.json', JSON.stringify(packagejson, null, 4));
  console.log('setup ready. edited package.json');
}
