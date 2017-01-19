function *foo() {
    try {
        var x = yield 3;
        console.log("x: ", x);
    } catch (err) {
        console.log("Error: ", err);
    }
}

var it = foo();
console.log(it.next());
// console.log(it.next('x'));

it.throw('Oops!');