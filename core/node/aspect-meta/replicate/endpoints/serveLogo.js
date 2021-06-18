import path from 'path';
import fs from 'fs';
import dmt from 'dmt/common';

function serveLogo(req, res) {
  const commonAssetsPath = path.join(dmt.dmtPath, 'core/node/gui/gui-frontend-core/common_assets');
  const logoPath = path.join(commonAssetsPath, 'img/dmt-logo.png');

  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(400).send({
      message: 'This is an error!'
    });
  }
}

export default serveLogo;
