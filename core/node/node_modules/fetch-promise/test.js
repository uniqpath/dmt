const fetchUrl = require('./index');

fetchUrl('https://www.npmjs.com/package/fetch-promise').then(
  result => {
    const { res, buf } = result;
    console.log(res, buf);
  },
  err => console.error(err)
);