const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

const buf1 = Buffer.from(arr);

const buf2 = Buffer.from(arr.buffer);

console.log(buf1);

console.log(buf2);

arr[1] = 6000;

console.log(buf1);

console.log(buf2);