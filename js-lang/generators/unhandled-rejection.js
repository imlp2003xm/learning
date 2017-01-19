function *foo() {
    try {
        yield 5;
    } catch (err) {
        console.log('Inside error: ', err);
    }
}

var it = foo();
try {
    console.log(it.next());
    it.throw('Oops!');
} catch (err) {
    console.log('Error: ', err);
}