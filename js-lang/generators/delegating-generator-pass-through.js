function *foo() {
    var z = yield 3;
    var w = yield 4;
    console.log('z: ', z, ', w: ', w);
}

function *bar() {
    var x = yield 1;
    var y = yield 2;
    yield *foo();
    var v = yield 5;
    console.log('x: ', x, ', y: ', y, ', v: ', v);
}

var it = bar();
console.log(it.next());
console.log(it.next('X'));
console.log(it.next('Y'));
console.log(it.next('Z'));
console.log(it.next('W'));
console.log(it.next('V'));