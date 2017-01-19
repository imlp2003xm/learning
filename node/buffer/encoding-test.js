const buf = Buffer.from('hello world', 'ascii');

console.log(buf.toString('hex'));

console.log(buf.toString('base64'));

const bufBase64 = Buffer.from('aGVsbG8gd29ybGQ=', 'base64');
console.log(buf.toString('utf-8'));