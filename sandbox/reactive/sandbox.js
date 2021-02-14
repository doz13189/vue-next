"use strict";
exports.__esModule = true;
exports["default"] = {};
var _a = require('../../packages/reactivity/dist/reactivity.cjs.js'), reactive = _a.reactive, effect = _a.effect;
// Object
var reactiveObj = reactive({ a: 1, b: 2 });
effect(function () {
    console.log('effect');
    reactiveObj.b = reactiveObj.a * 10;
});
console.log('before');
console.log(reactiveObj.b);
reactiveObj.a = 10;
console.log('after');
console.log(reactiveObj.b);
