const fs = require('fs');

let settings = fs.readFileSync('dmt/settings.json', 'utf-8');
settings = JSON.parse(settings);

// this is important as it passes the app_base to the dmt installer
console.log(settings.app_base);
