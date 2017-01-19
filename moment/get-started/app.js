const moment = require('moment');

moment.locale('zh-CN');

console.log(moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));
console.log(moment().format('LTS'));
