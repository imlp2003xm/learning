define({
    name: 'samupanz18\'s cart',
    count: 0,
    add: function(item) {
        this.count++;
        console.log('item is added into the cart.');
    },
    printCount: function() {
        console.log('There are ', this.count, ' items in the cart.')
    }
});