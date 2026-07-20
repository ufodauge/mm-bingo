# TypeScript 向け Skill

## 基本方針

- strict mode を前提に実装する
- 実装は可能な限り純粋関数として記述する
- DB、fetch、file system、console、日時、乱数などの副作用は境界層に隔離する
- 入力値、入力配列、入力オブジェクトを破壊的に変更しない
- 予期される失敗は `throw` ではなく `Result`、`Nullable`、または discriminated union で表現する
- 非同期処理は `Promise.all` などで合成可能な形にする
- 不正状態は型で表現不能にする
- Web Stream API は `pipeThrough` / `pipeTo` を優先し、chunk 境界と back-pressure を壊さない
- 作業完了前に linter で error / warning がないことを確認する

## 共通コーディング原則

### Result / Nullable を使ったエラー処理

- 予期される失敗は `Result<T, E>` で返す
- 値が存在しない可能性は `T | undefined` で表す
  - 基本的には `undefined` を優先する
  - ただし `null` と `undefined` を無条件に同一視してはならない。JSON.stringify・localStorage (`atomWithStorage` 等)・ネットワーク経由のメッセージなど **JSON 境界を跨ぐ値** では `undefined` を持つキーが消える (`JSON.stringify({a: undefined})` は `"{}"` になりキーごと失われる) ため、そうした境界を跨ぐ「値が無い」は `null` で明示する。境界を跨がない、純粋にメモリ内だけで完結する値（コンポーネントの props/state、関数の戻り値など）は `undefined` を使う
- 欠損理由や invalid value を呼び出し側が区別する必要がある場合は、`undefined` だけに潰さず `Result` または discriminated union で理由を表す
- `throw` は想定外・復帰不可能なプログラミングエラーまたは境界層に限定する
- 複数の validation error は配列として蓄積する
- `map`, `flatMap`, `mapError`, `sequence` などの合成関数や optional chain を活用する

### validator

- 基本的にはバリデーションライブラリ（valibot, zod など）を利用する
- 自前実装する場合は以下の validator composition を守る

#### validator composition

- 大きな validator を一枚岩にしない
- field ごとの小さな validator を作る
- validation error は構造化する
- `unknown` から段階的に型を絞る
- 型アサーションではなく type guard を優先する

### immutable update

- 入力を直接変更しない
- 配列操作は `map`, `filter`, `flatMap`, `reduce`, `toSorted`, `toReversed`, `toSpliced` を優先する
- オブジェクト更新は spread または明示的な constructor を利用する
- 深い更新では、変更が必要な部分だけ新しい参照を作る
- 深い探索では、変更箇所が見つかった後に不要なサブツリーを走査し続けない設計を優先する

### declarative data transformation

- データ変換を処理手順ではなく変換パイプラインとして表現する
- 小さな純粋関数を合成する
- ルールや分岐を可能な範囲でデータ構造として表現する
- `reduce` は濫用せず、読みにくい場合は helper 関数を作る
- 集計が必要な場合は、可変 accumulator を直接更新する前に、状態更新を純粋 helper 関数として切り出せないか検討する

### state machine modeling

- 状態は discriminated union で表現する
- 不正状態を boolean flags で表現しない
- 状態遷移は reducer または transition table として実装する
- 状態側とイベント側の両方で網羅性が読めるように、ネストした `switch` または transition table を使う
- exhaustive check を入れる
- 不正遷移は `Result` で返す

### async composition

- 独立した非同期処理は `Promise.all` で合成する
- 逐次実行が必要な場合は理由を明確にする
- `AbortSignal` を受け取り、fetch へ伝播する
- エラーは構造化した `Result` として扱う
- `try-catch` は境界で最小限に留める

### stream pipeline

- Web Stream API では `pipeThrough` / `pipeTo` を優先する
- `TransformStream` を小さな部品として定義する
- parse error は stream 全体のクラッシュではなく値として流す
- back-pressure, cancel, abort, error propagation を考慮する
- `WritableStream` などの sink 境界で局所ミューテーションが必要な場合も、summary や state の更新規則は純粋 helper に分離する

### pure core / imperative shell

- ビジネスロジックは pure core として実装する
- DB / API / mail / logging などは imperative shell に隔離する
- 副作用を直接実行せず、必要に応じて `Command` として記述する
- テストは pure core を中心に行う

### lint / typecheck / test discipline

- lint error / warning, type error, test failure を残さない
- 型エラーを `as any` で隠さない
- lint rule を無効化しない
- テスト通過後に `push`, `as any`, `eslint-disable`, `throw`, `Date.now`, `Math.random`, `structuredClone` などを検索し、残す場合は理由を記録する

## 禁止事項

- テストを弱める、削除する、期待値を変更する
- lint 回避だけを目的に `eslint-disable` を入れる
- 型エラーを隠すためだけに `as any` や根拠のない `unknown as SomeType` を使う
- 予期されるエラーを `throw` で表現する
- `catch` でエラーを握りつぶす
- 入力オブジェクトや入力配列を mutate する
- 純粋ロジック内でグローバル状態、`Date.now()`、`Math.random()`、環境変数を直接読む
- ドメインロジックに DB、fetch、file system、console などの副作用を混ぜる
- テスト通過のためだけのハードコードを行う
- 不正状態を boolean flags の組み合わせで表現する

## 例外的に許容されるもの

- 関数内部に閉じた局所的な `let`
- パフォーマンス上必要な局所的ミューテーション
- 外部に漏れない `Map` / `Set` による内部集計
- 境界層での最小限の `try-catch`
- 外部ライブラリの型不足を補う最小限の型アサーション
- 例外を使う場合も、入力を破壊せず、外部から観測可能な副作用を発生させず、型安全性を著しく損なわないこと。必要なら短いコメントで理由を説明する
