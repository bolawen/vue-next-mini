(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    var quantity = 2;
    var product = {
        price: 10,
        quantity: quantity
    };
    function computed() {
        return product.price * product.quantity;
    }
    Object.defineProperty(product, 'quantity', {
        get: function () {
            return quantity;
        },
        set: function (value) {
            quantity = value;
            computed();
        }
    });
    product.quantity = 2;
    console.log("\u603B\u4EF7\u4E3A: ".concat(computed()));
    product.quantity = 10;
    console.log("\u603B\u4EF7\u4E3A: ".concat(computed()));

}));
//# sourceMappingURL=vue.js.map
