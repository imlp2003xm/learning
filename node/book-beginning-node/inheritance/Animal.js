function Animal(name) {
    this.name = name;
}

Animal.prototype.walk = function(destination) {
    console.log(this.name, 'is walking to', destination);
}

module.exports = Animal;