requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        // jquery: 'jquery-3.1.1'
        // jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.4x/jquery.min'
        jquery: [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min',
            'jquery-3.1.1'
        ]
    },
    shim: {
        jquery: {
            exports: '$'
        }
    }
});

require([
    'jquery', 
    'app/my/shirt', 
    'app/my/hat', 
    'app/my/cart', 
    'app/foo/title', 
    'app/CommonJSModules/increment'
    ], function(
        $, 
        shirt, 
        hat, 
        cart, 
        titleFunc,
        increment) 
    {
        // $(function() {
        //     shirt.addToCart();
        //     hat.addToCart();
        //     cart.printCount();

        //     $('.shirt-color').append(shirt.color);
        //     $('.shirt-size').append(shirt.size);

        //     var title = titleFunc();
        //     console.log(title);

        //     var age = 35;
        //     age = increment(age);
        //     console.log('age: ', age);
        // });

        require(['domReady'], function(domReady) {
            domReady(function() {
                console.log('dom is ready!');
            });
        });

        // require(['domReady!'], function(doc) {
        //     console.log('dom is ready!');
        // });        
    }/*, function(error) {
        var failedId = error.requireModules && error.requireModules[0];
        if (failedId === 'jquery') {
            requirejs.undef(failedId);
            requirejs.config({
                paths: {
                    jquery: 'jquery-3.1.1'
                }
            });
            require(['jquery'], function() {});
        }
    }*/
);