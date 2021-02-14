// function targetTypeMap(rawType: string) {
//   switch (rawType) {
//     case 'Object':
//     case 'Array':
//       return TargetType.COMMON
//     case 'Map':
//     case 'Set':
//     case 'WeakMap':
//     case 'WeakSet':
//       return TargetType.COLLECTION
//     default:
//       return TargetType.INVALID
//   }
// }
var _a = require('../../packages/reactivity/dist/reactivity.cjs.js'), reactive = _a.reactive, effect = _a.effect, isReactive = _a.isReactive;
// Object
var reactiveObj = reactive({ a: 1, b: 2 });
console.log(isReactive(reactiveObj));
effect(function () {
    reactiveObj.b = reactiveObj.a * 10;
});
console.log(reactiveObj);
reactiveObj.a = 10;
console.log(reactiveObj);
// Array
var reactiveArr = reactive([{ a: 1 }, { b: 2 }]);
console.log(isReactive(reactiveArr));
effect(function () {
    reactiveArr[1].b = reactiveArr[0].a * 10;
});
console.log(reactiveArr);
reactiveArr[0].a = 10;
console.log(reactiveArr);
// Map
var mp = new Map();
mp.set('a', 1);
mp.set('b', 2);
var reactiveMap = reactive(mp);
console.log(isReactive(reactiveMap));
effect(function () {
    reactiveMap.set('b', reactiveMap.get('a') * 10);
});
console.log(reactiveMap.get('b'));
reactiveMap.set(('a'), 10);
console.log(reactiveMap.get('b'));
// Set
var st = new Set();
st.add({ a: 1 });
var reactiveSet = reactive(st);
console.log(isReactive(reactiveSet));
effect(function () {
    reactiveSet.forEach(function (value) {
        if (value.hasOwnProperty('a')) {
            reactiveSet.add({ b: Number(Object.values(value)[0]) * 10 });
        }
    });
});
reactiveSet.forEach(function (value) { return console.log('value', value); });
reactiveSet.add({ a: 10 });
reactiveSet.forEach(function (value) { return console.log('value', value); });
// WeakMap
var wm = new WeakMap();
var o1 = { a: 1 };
var o2 = { b: 2 };
wm.set(o1, 1);
wm.set(o2, 2);
var reactiveWm = reactive(wm);
console.log(isReactive(reactiveWm));
effect(function () {
    reactiveWm.set(o2, reactiveWm.get(o1) * 10);
});
console.log(reactiveWm.get(o2));
reactiveWm.set(o1, 10);
console.log(reactiveWm.get(o2));
