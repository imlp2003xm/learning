function *foo(x) {
    var y = 2 * (yield (x + 1));
    var z = yield (y / 3);
    return (x + y + z);
}

var it = foo(5);

console.log(it.next());
console.log(it.next(12));
console.log(it.next(13));