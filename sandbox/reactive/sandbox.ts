export default {}

const { reactive, effect } = require('../../packages/reactivity/dist/reactivity.cjs.js')

// Object
const reactiveObj = reactive({ a: 1, b: 2 })

effect(() => {
  console.log('effect')
  reactiveObj.b = reactiveObj.a * 10
})

console.log('before')
console.log(reactiveObj.b)
reactiveObj.a = 10
console.log('after')
console.log(reactiveObj.b)

