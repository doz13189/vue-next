var _a = require('../packages/reactivity/dist/reactivity.cjs.js'), reactive = _a.reactive, readonly = _a.readonly;
var readonlyRObj = readonly({
    a: 1,
    b: 2,
    c: {
        d: 4,
        e: 5
    }
});
var reactiveObj = reactive(readonlyRObj);
// const reactiveObj = reactive({
//   a: 1,
//   b: 2,
//   c: {
//     d: 4,
//     e: 5
//   }
// })
