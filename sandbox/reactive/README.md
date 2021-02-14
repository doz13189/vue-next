# Vue3 の reactivity 部分のソースコードを読む

## はじめに
あとで何か書く。


## 事前知識

- Proxy  
知っておかないと Vue3 のソースコードが読めないと思います。
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Proxy


- Reflect  
何なのかは知っておかないと Vue3 のソースコードを読むときに詰まります。
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Reflect

- WeakMap  
何なのかは知っておかないと Vue3 のソースコードを読むときに詰まります。
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

- Object.defineProperty()  
Vue2 のリアクティブの実装に使用されていました。Vue3 からはリアクティブの内部実装がゴリッと変わっているため、見てみると楽しめる気がします。
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

- リアクティブの探求  
いきなりソースコードは読めないと思うので、公式に記載されているリアクティブ実装の簡単な例を読むのが良いと思います。私は Vue Mastery ユーザーなのでこの記事はサラッとしか目を通していないです、たぶん似たようなもんです。  
https://v3.ja.vuejs.org/guide/reactivity.html#vue-%E3%81%8B%E3%82%99%E3%81%93%E3%82%8C%E3%82%89%E3%81%AE%E5%A4%89%E6%9B%B4%E3%82%92%E8%BF%BD%E8%B7%A1%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95


## 読む対象のソースコード
https://github.com/vuejs/vue-next/tree/master/packages/reactivity/src

Vue2 では、`Object.defineProperty()` を使用してリアクティブのロジックは実装されていましたが、Vue3 からは `Proxy` による実装に変更されています。`Proxy` による実装がどのようにされているかをソースコードをベースに確認します。

ソースコードは全部は読めないので、Composition API でリアクティブなコードを一番シンプルに書くと、以下のようになると思うので、このコードで実行される部分をターゲットにソースコードを読んでいきます。

```typescript
import { reactive, effect } from 'vue';

// Object
const reactiveObj = reactive({ a: 1, b: 2 })

effect(() => {
  reactiveObj.b = reactiveObj.a * 10
})
console.log(reactiveObj)
// { a: 1, b: 10 }

reactiveObj.a = 10

console.log(reactiveObj)
// { a: 10, b: 100 }
```

## 大まかな流れ

```typescript
// { a: 1, b: 2 } をProxy オブジェクトに変換する。
const reactiveObj = reactive({ a: 1, b: 2 })

// reactiveObj.a の値が更新されたときに実行する関数として effect 関数を登録する。
effect(() => {
  reactiveObj.b = reactiveObj.a * 10
})
console.log(reactiveObj)
// { a: 1, b: 10 }

// reactiveObj.a の値が更新されたので、effect 関数を実行する
reactiveObj.a = 10

console.log(reactiveObj)
// { a: 10, b: 100 }
```

## 細かな流れ

### Proxy オブジェクトへの変換

この部分、読みます。

```typescript
const reactiveObj = reactive({ a: 1, b: 2 })
```

ソースコードの該当箇所は、以下です。
https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/reactive.ts

`reactive` 関数は、渡されたターゲットオブジェクト(`{ a: 1, b: 2 }`)を Proxy オブジェクトへ変換しています。ただ、実際の変換は `reactive` 関数ではなく、`createReactiveObject` 関数がしているので、`reactive` 関数は、渡されたターゲットオブジェクトと Proxy オブジェクトのハンドラー(`mutableHandlers` と `mutableCollectionHandlers`)を `createReactiveObject` 関数に渡しているだけです。

```typescript
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}
```

`createReactiveObject` 関数は、リアクティブ化させたいターゲットオブジェクトを `Proxy` オブジェクトに変換しています。
`createReactiveObject` 関数の行数は、40 行くらいありますが、そのほとんどはメイン処理ではありません。メイン処理以外が何をやっているかと言うと、例えば、`Proxy` オブジェクトに変換する必要かあるかどうかをチェックしたり、どの `Proxy` ハンドラーを使うかを判定したり（ターゲットオブジェクトが `Object` か `Map` かで使うハンドラーが異なるため）と...
メインの処理（ `Proxy` オブジェクトに変換）は、以下です。`return` を見れば分かる通り、`Proxy` オブジェクトが返されています。

```typescript
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {

  // ...省略

  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}
```

ここまでで Proxy オブジェクトへの変換が完了しました。

## reactiveObj.a の値が更新されたときに実行する関数として effect 関数を登録する

この部分、読みます。

```typescript
effect(() => {
  reactiveObj.b = reactiveObj.a * 10
})
```

ソースコードの該当箇所は、以下です。
https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/effect.ts

`effect` 関数では、リアクティブなオブジェクトが更新されたときに、発火させたい関数を実行します。`effect` 関数が実行されることで、`reactiveObj.b = reactiveObj.a * 10` が実行されます。`effect` 関数の実行時では、`reactiveObj` は既に `Proxy` オブジェクトであるため、`reactiveObj.a` は、`Proxy` ハンドラーのゲッターによって呼ばれます。次は、Proxy オブジェクトのゲッターのソースコードを読みます。
`createReactiveEffect` 関数は、ソースコード読み切れていないので割愛します。

```typescript
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  if (isEffect(fn)) {
    fn = fn.raw
  }
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}
```

## Proxy のゲッターの呼び出し

この部分、読みます。

```typescript
// effect(() => {
  reactiveObj.b = reactiveObj.a * 10
// })
```

この部分は、ゲッターとセッターの2パートに分かれています。値を取得している `reactiveObj.a` は、ゲッターで、値を更新している `reactiveObj.b` はセッターです。セッターは、後続にある別のコードでソースコードを読むので、ここではゲッターに関するコードを読みます。


ソースコードの該当箇所は、以下です。
https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/baseHandlers.ts


`createGetter` 関数は `Proxy` ハンドラーのゲッターなので、ゲッターとしてのメイン処理である取得対象の値を返すこと、これともう一つ大事なことを処理しており、それは依存関係の構築です。`reactiveObj.a` の値を使用して、`reactiveObj.b = reactiveObj.a * 10` の計算を実行しているため、`reactiveObj.b` の値は `reactiveObj.a` の値に依存しています。そのため、 `reactiveObj.a` の値が更新されたら、 `reactiveObj.b` の値も更新する必要があります。まとめると、`reactiveObj.a` の値が更新された場合は、`reactiveObj.b = reactiveObj.a * 10` を実行する必要があります。これが依存関係の構築で、それをしているのが `track` 関数です。（依存関係の構築までが `track` 関数なので、依存関係にある関数の実行はまた別の関数がしています。）
書き忘れていましたが、ゲッターの方は、 `Reflect.get()` によって実行されています。

```typescript
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {

    // ...省略

    const res = Reflect.get(target, key, receiver)

    // ...省略

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    // ...省略

    return res
  }
}
```

`track` 関数では、依存関係の構築をしています。
以下は、かなり思い切って省略していますが、メイン処理としては `activeEffect` に格納されている `reactiveObj.b = reactiveObj.a * 10` を `deps` にプッシュしています。 

```typescript
export function track(target: object, type: TrackOpTypes, key: unknown) {
  
  // ...省略

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    
    // ...省略

  }
}
```

## Proxy のセッターの呼び出し

この部分、読みます。
`reactiveObj.a` の値を更新しているセッターです。

```typescript
reactiveObj.a = 10
```

ソースコードの該当箇所は、以下です。
https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/baseHandlers.ts

`reactiveObj.a` が更新されたため、Proxy オブジェクトのセッターが呼ばれます。セッターの処理は大きく2つあり、1つは `reactiveObj.a` の値の更新であり、`Reflect.set()` によって実行されます。もう1つは、依存関係として登録してた関数の実行です。

> （依存関係の構築までが `track` 関数なので、依存関係にある関数の実行はまた**別の関数**がしています。）

上記の**別の関数**が `trigger` 関数です。

```typescript
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {

    // ...省略

    const result = Reflect.set(target, key, value, receiver)
    
    // ...省略

    trigger(target, TriggerOpTypes.SET, key, value, oldValue)

    // ...省略

  }
}
```

`trigger` 関数は、`track` 関数によって登録された関数を実行します。`targetMap.get(target)` によって取得した依存関係を `add` 関数で `effects` という Set オブジェクトに追加しています。そして、最後に `effects.forEach(run)` で実行しています。

```typescript
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {

  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }

  const effects = new Set<ReactiveEffect>()
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect || effect.allowRecurse) {
          effects.add(effect)
        }
      })
    }
  }

  if (type === TriggerOpTypes.CLEAR) {

    // ...省略

  } else if (key === 'length' && isArray(target)) {

    // ...省略

  } else {
    
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      add(depsMap.get(key))
    }

    // ...省略

}

  const run = (effect: ReactiveEffect) => {

    // ...省略

    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  effects.forEach(run)
}

```

## まとめ
けっこう素人なので読み間違いあるかもしれません。
