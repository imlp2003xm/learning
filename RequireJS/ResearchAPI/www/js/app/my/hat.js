define(['./cart', './inventory'], function(cart, inventory) {
    return {
        style: 'casual',
        addToCart: function() {
            inventory.decrement(this);
            cart.add(this);
        }
    }
});