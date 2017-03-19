var user = 'johnny';
var pass = 'c-bad';
var authstring = user + ':' + pass;

// encoding
var authorization = (new Buffer(authstring)).toString('base64');
console.log(authorization);

// decoding
var rawData = (new Buffer(authorization, 'base64')).toString();
console.log(rawData);