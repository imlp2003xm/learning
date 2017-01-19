function *foo() {
    yield 2;
    yield 3;
    return 'foo';
}

function *bar() {
    yield 1;
    var v = yield *foo();
    console.log('v: ', v);
    yield 4;
}

var it = bar();
console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());