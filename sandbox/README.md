
https://github.com/vuejs/vue-next/tree/master/packages/reactivity/src

reactivity から '@vue/shared' など異なるディレクトリから呼ばれているプロブラムもあるので、ビルドする。

```bash
yarn build
```

node で実行するため、cjs でビルドする。

```bash
yarn dev reactivity --formats cjs
```


```bash
./node_modules/.bin/tsc ./sandbox/sandbox.ts && node ./sandbox/sandbox.js
```


## shallow
shallow means, when you set an object into another object, as a nested property,
it doesn't try to convert it into a reacted one.

https://v3.vuejs.org/api/basic-reactivity.html#markraw

## reactive

```typescript
// https://github.com/vuejs/vue-next/blob/ec8fd10cec61c33c7c8056413a1c609ac90e1215/packages/reactivity/src/reactive.ts#L85

export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  // target が readonly かどうかを確認している
  // readonly については以下を確認する
  // https://v3.vuejs.org/api/basic-reactivity.html#readonly
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }

  // createReactiveObject の引数は以下を受け取る
  // function createReactiveObject(target: Target, isReadonly: boolean, baseHandlers: ProxyHandler<any>, collectionHandlers: ProxyHandler<any>): any
  return createReactiveObject(
    target, // target
    false, // isReadonly
    mutableHandlers, // baseHandlers
    mutableCollectionHandlers // collectionHandlers
  )
}
```


```typescript
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {

  // target が Object かどうかを確認
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // target already has corresponding Proxy
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // only a whitelist of value types can be observed.
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}
```

