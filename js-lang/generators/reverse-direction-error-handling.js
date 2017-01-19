function *foo() {
    var x = yield 3;
    var y = x.toUpperCase();
    yield y;
}

var it = foo();
console.log(it.next());

try {
    console.log(it.next(42));
} catch (err) {
    console.log(err);
}