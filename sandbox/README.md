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
