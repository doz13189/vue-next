// const { reactive, readonly } = require('../packages/reactivity/dist/reactivity.cjs.js')
// const readonlyRObj = readonly({
//   a: 1,
//   b: 2,
//   c: {
//     d: 4,
//     e: 5
//   }
// })
// const reactiveObj = reactive(readonlyRObj)

const { reactive } = require('../packages/reactivity/dist/reactivity.cjs.js')
const reactiveObj = reactive({
  a: 1,
  b: 2,
  c: {
    d: 4,
    e: 5
  }
})
reactiveObj.a = 3


