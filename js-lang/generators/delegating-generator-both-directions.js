function *foo() {
    try {
        yield 2;
        console.log('The second step started.');
    } catch (err) {
        console.log('foo caught: ', err);
    }

    yield 'Apple';

    throw 'Oops!';
}

function *bar() {
    yield 1;
    console.log('The first step started.');
    try {
        yield *foo();
    } catch (err) {
        console.log('bar caught: ', err);
    }
}

var it = bar();
console.log(it.next());
console.log(it.next());

console.log(it.throw('Uh oh!'));
console.log(it.next());