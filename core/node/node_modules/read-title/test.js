/* 
* @Author: zyc
* @Date:   2015-12-10 18:39:06
* @Last Modified by:   zyc
* @Last Modified time: 2015-12-14 15:14:29
*/
'use strict';

const readTitle = require('./index');

readTitle('https://www.npmjs.com/package/read-title').then(
  title => console.log(title),
  err => console.error(err)
);