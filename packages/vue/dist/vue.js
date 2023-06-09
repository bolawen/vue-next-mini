(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    var quantity = 2;
    var product = {
        price: 10,
        quantity: quantity,
        a: function () {
            console.log(this);
        }
    };
    var proxyProduct = new Proxy(product, {
        get: function (target, property, receiver) {
            return Reflect.get(target, property, receiver);
        },
        set: function (target, property, value, receiver) {
            var result = Reflect.set(target, property, value, receiver);
            computed();
            return result;
        }
    });
    function computed() {
        return proxyProduct.price * proxyProduct.quantity;
    }
    proxyProduct.a();
    proxyProduct.quantity = 2;
    console.log("\u603B\u4EF7\u4E3A: ".concat(computed()));
    proxyProduct.quantity = 10;
    console.log("\u603B\u4EF7\u4E3A: ".concat(computed()));

}));
//# sourceMappingURL=vue.js.map
