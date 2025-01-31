import crypto from 'crypto';

export default function getObjHash(obj) {
  const cleanObj = Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
  );

  const str = JSON.stringify(cleanObj);

  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}
