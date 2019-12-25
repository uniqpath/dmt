const path = require('path');
const fs = require('fs');
const dmt = require('dmt-bridge');

function serveLogo(req, res) {
  const commonAssetsPath = path.join(dmt.dmtPath, 'core/node/dmt-gui/gui-frontend-core/common_assets');
  const logoPath = path.join(commonAssetsPath, 'img/dmt-logo.png');

  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(400).send({
      message: 'This is an error!'
    });
  }
}

module.exports = serveLogo;
