import crypto from 'crypto';

const sha256 = x =>
  crypto
    .createHash('sha256')
    .update(x, 'utf8')
    .digest('hex');

export default sha256;
