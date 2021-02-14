export default {}

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

const { reactive, effect, isReactive } = require('../packages/reactivity/dist/reactivity.cjs.js')

// Object
const reactiveObj = reactive({ a: 1, b: 2 })
console.log(isReactive(reactiveObj))
effect(() => {
  reactiveObj.b = reactiveObj.a * 10
})

console.log(reactiveObj)
reactiveObj.a = 10
console.log(reactiveObj)

// Array
const reactiveArr = reactive([{ a: 1 }, { b: 2 }])
console.log(isReactive(reactiveArr))
effect(() => {
  reactiveArr[1].b = reactiveArr[0].a * 10
})
console.log(reactiveArr)
reactiveArr[0].a = 10
console.log(reactiveArr)

// Map
const mp = new Map()
mp.set('a', 1)
mp.set('b', 2)
const reactiveMap = reactive(mp)
console.log(isReactive(reactiveMap))
effect(() => {
  reactiveMap.set('b', reactiveMap.get('a') * 10)
})
console.log(reactiveMap.get('b'))
reactiveMap.set(('a'), 10);
console.log(reactiveMap.get('b'))

// Set
const st = new Set()
st.add({ a: 1 })
const reactiveSet = reactive(st)
console.log(isReactive(reactiveSet))
effect(() => {
  reactiveSet.forEach(value => {
    if (value.hasOwnProperty('a')) {
      reactiveSet.add({ b: Number(Object.values(value)[0]) * 10 })
    }
  })
})
reactiveSet.forEach(value => console.log('value', value))
reactiveSet.add({ a: 10 })
reactiveSet.forEach(value => console.log('value', value))


// WeakMap
const wm = new WeakMap()
const o1 = { a: 1 }
const o2 = { b: 2 }
wm.set(o1, 1);
wm.set(o2, 2);
const reactiveWm = reactive(wm)

console.log(isReactive(reactiveWm))
// true

effect(() => {
  reactiveWm.set(o2, reactiveWm.get(o1) * 10)
})
console.log(reactiveWm.get(o2))
// 10

reactiveWm.set(o1, 10);
console.log(reactiveWm.get(o2))
// 100






