/* 
* @Author: zyc
* @Date:   2015-12-10 18:36:06
* @Last Modified by:   zyc
* @Last Modified time: 2016-03-18 15:27:24
*/
'use strict';

const fetchUrl = require('fetch-promise');
const cheerio = require('cheerio');

module.exports = url => {
  return new Promise((resolve, reject) => {
    fetchUrl(url).then(
      result => {
        const { res, buf } = result;
        const $ = cheerio.load(buf);
        const title = $('head title').text().trim();
        const commonSeparatingCharacters = [' | ', ' _ ', ' - ', '«', '»', '—'];
        for (let char of commonSeparatingCharacters) {
          const tmpArray = title.split(char);
          if (tmpArray.length > 1) {
            const betterTitle = tmpArray[0].trim();
            if (betterTitle.length > 10) {
              return resolve(betterTitle);
            }
          }
        }
        resolve(title);
      },
      err => reject(err)
    );
  });
};