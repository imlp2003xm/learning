// import { square, diag } from './lib';

// console.log(square(11));
// console.log(diag(3, 4));

// import * as lib from './lib';
// console.log(lib.square(11));
// console.log(lib.diag(3, 4));


// import myFunc from './MyFunc'
// myFunc();

// import MyClass from './MyClass';

// let obj = new MyClass();
// obj.introduce();


// import { counter, incCounter } from './lib';
// console.log(counter);
// incCounter();
// console.log(counter);

System.import('./libx').then(({ calculateCircleArea }) => {
    console.log('The area of circle with radius 5 is: ', calculateCircleArea(5));
});