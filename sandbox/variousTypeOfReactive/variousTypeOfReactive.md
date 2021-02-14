# Vue3 の Composition API の reactive() は Map や Set も扱える

## 前置き
Vue3 の Composition API で使う `reactive()` は、`Map()`, `Set()`, `WeakMap()`, `WeakSet()` も扱えることに気づいたので、メモ程度に残しておきます。

## シンプルな reactive() の使い方

シンプルにオブジェクトを定義して、`a` というキーの値が更新されると、リアクティブに `b` の値を `a` の10倍で更新する、という処理です。

```typescript
import { reactive, effect, isReactive } from 'vue';

// Object
const reactiveObj = reactive({ a: 1, b: 2 })

console.log(isReactive(reactiveObj))
// true

effect(() => {
  reactiveObj.b = reactiveObj.a * 10
})

console.log(reactiveObj)
// { a: 1, b: 10 }

reactiveObj.a = 10

console.log(reactiveObj)
// { a: 10, b: 100 }
```

## new Map() で同じことをする

`a` に 10 を代入すると、`b` は 100 に更新されています。

```typescript
// Map
const mp = new Map()
mp.set('a', 1)
mp.set('b', 2)
const reactiveMap = reactive(mp)

console.log(isReactive(reactiveMap))
// true

effect(() => {
  reactiveMap.set('b', reactiveMap.get('a') * 10)
})

console.log(reactiveMap.get('b'))
// 10

reactiveMap.set(('a'), 10);

console.log(reactiveMap.get('b'))
// 100
```

## new Set() で同じことをする

`a` に 10 を代入すると、`b` は 100 に更新されています。

```typescript
// Set
const st = new Set()
st.add({ a: 1 })
const reactiveSet = reactive(st)

console.log(isReactive(reactiveSet))
// true

effect(() => {
  reactiveSet.forEach(value => {
    if (value.hasOwnProperty('a')) {
      reactiveSet.add({ b: Number(Object.values(value)[0]) * 10 })
    }
  })
})
reactiveSet.forEach(value => console.log(value))
// value { a: 1 }
// value { b: 10 }

reactiveSet.add({ a: 10 })
reactiveSet.forEach(value => console.log(value))
// value { a: 10 }
// value { b: 100 }
```

## new WeakMap() で同じことをする

`o1` に 10 を代入すると、`o2` は 100 に更新されています。

```typescript
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
```

## new Array() はうまくいかない

`a` に 10 を代入すると、`b` は 100 に更新される、という面においては、リアクティブになっています。しかし、元の`[{ a: 1 }, { b: 2 }]` に加えて、`'0': { a: 1 }, '1': { b: 10 }` というオブジェクトが新しく追加されています。これだと、配列系の関数である`.map()` や `.filter()` は、意図している動作にならない気がします。
ただ、ソースコードを見る限り、きっと意図的な仕様なのでもうちょっと調べてみる必要がありますが、`reactive()` を Array 型に対して使うのは一旦なしかなと。

```typescript
// Array
const reactiveArr = reactive([{ a: 1 }, { b: 2 }])

console.log(isReactive(reactiveArr))
// true

effect(() => {
  reactiveArr[1].b = reactiveArr[0].a * 10
})

console.log(reactiveArr)
// [ { a: 1 }, { b: 10 }, '0': { a: 1 }, '1': { b: 10 } ]

reactiveArr[0].a = 10

console.log(reactiveArr)
// [ { a: 10 }, { b: 100 }, '0': { a: 10 }, '1': { b: 100 } ]
```

## reactive() が対応している型は結局何？

公式には、`reactive()` の型チェックは以下のように定義してあると書かれています。

```typescript
function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
```
https://v3.vuejs.org/api/basic-reactivity.html#reactive

`object` であれば、何でも OK ということですね。
そういうことであれば、`Map()`, `Set()`, `WeakMap()`, `WeakSet()` もすべて `object` なので OK ということだと思います。

```javascript
typeof new Array()
"object"

typeof new Map()
"object"

typeof new WeakMap()
"object"

typeof new Set()
"object"

typeof new WeakSet()
"object"
```

## ソースコードベースで reactive() が対応してる型を確認する

`reactive()` のターゲットオブジェクトのタイプを判定する処理があります。
`Object`, `Array`, `Map`, `Set`, `WeakMap`, `WeakSet` 以外の場合は、`INVALID` を返してるので、ここに書かれているオブジェクトタイプが `reactive()`
の対応している型と言えそうです。

```typescript
function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}
```
https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/reactive.ts

`Object` と `Array` が `TargetType.COMMON` を返し、それ以外が `TargetType.COLLECTION` を返しているのは、Proxy オブジェクトのハンドラーが異なるため、判定処理を入れているようです。ここで判定した処理結果は、以下の箇所で使用されています。

```typescript
const proxy = new Proxy(
  target,
  targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
)
```

## まとめ

Array 型は、もうちょっと調べる必要はありますが、他の型はリアクティブに扱えそうなので、アイデアがあれば実装で使ってみようと思います。

