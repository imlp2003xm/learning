let { inherits } = require('util');

let Animal = require('./Animal');

/*let animal = new Animal('elephant');
animal.walk('melbourne');*/

function Bird(name) {
    Animal.call(this, name);
}

inherits(Bird, Animal);

Bird.prototype.fly = function(destination) {
    console.log(this.name, 'is flying to', destination);
}

let bird = new Bird('sparrow');
bird.walk('sydney');
bird.fly('melbourne');