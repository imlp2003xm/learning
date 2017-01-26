var fs = require('fs');
// import fs from 'fs'; // Doesn't support ES6 Module

fs.readFile('./names.txt', /*'utf-8', */(err, buf) => {
    console.log(buf.toString('utf-8'));
});