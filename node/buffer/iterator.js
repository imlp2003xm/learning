const buf = Buffer.from([1, 2, 3]);

/*for (var b of buf) {
    console.log(b);
}*/

let it = buf[Symbol.iterator]();
let result;
while (!(result = it.next()).done) {
    console.log(result.value);
}