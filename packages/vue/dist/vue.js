(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    var product = {
        price: 10,
        quantity: 2
    };
    var total;
    function effect() {
        total = product.price * product.quantity;
    }
    effect();
    console.log("\u603B\u4EF7\u4E3A: ".concat(total));
    product.quantity = 10;
    effect();
    console.log("\u603B\u4EF7\u4E3A: ".concat(total));

}));
//# sourceMappingURL=vue.js.map
