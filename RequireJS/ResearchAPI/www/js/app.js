requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        jquery: 'jquery-3.1.1'
    }
});

require(['app/my/shirt', 'jquery'], function(shirt, $) {
    $(function() {
        $('.shirt-color').append(shirt.color);
        $('.shirt-size').append(shirt.size);
    });
});