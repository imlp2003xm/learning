// define({
//     color: 'black',
//     size: 'unisize'
// });


define(['./cart', './inventory'], function(cart, inventory) {
    return {
        color: 'blue',
        size: 'large',
        addToCart: function() {
            inventory.decrement(this);
            cart.add(this);  
        }
    };
});