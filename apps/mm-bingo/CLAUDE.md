# mm-bingo アプリ固有メモ

## Lint 構成: oxlint + eslint の役割分担、重複させない

- `oxlint` を主体の高速 linter とする。一般的な JS/TS の正当性チェック（`no-unused-vars` 等の correctness 系、`react/rules-of-hooks`、`react/exhaustive-deps`、`react/only-export-components` 等）は基本的にすべて oxlint (`.oxlintrc.json`) 側で担う。
- `eslint`（`eslint.config.js`）は **React Compiler 向けルールの専任**にする。`eslint-plugin-react-hooks` v7+ の recommended に含まれる `purity`/`immutability`/`set-state-in-render`/`gating` 等は oxlint にまだ相当プラグインが無いため、ここでしかチェックできない。
- そのため `eslint.config.js` は `tseslint.configs.base`（parser/plugin 登録のみ、ルールは持たない）+ `eslint-plugin-react-hooks` の recommended のみを使う。`@eslint/js` の recommended、`tseslint.configs.recommended`、`eslint-plugin-react-refresh` は意図的に入れていない — いずれも oxlint 側の既存ルールと重複するため（後者は oxlint の `react/only-export-components` と同一効果）。
- 新しいチェックを追加したくなったら、まず oxlint でカバーできないか確認し、できない場合のみ eslint 側に足す。両方に同じ趣旨のルールを重複して足さないこと。

## TypeScript は classic 系に固定している（Native Preview へ上げない）

- `typescript` は現在 classic 系（6.x 系）に固定している。**TypeScript Native Preview（7.x 系、Go 実装）に上げると `typescript-eslint@8.63.0` が動かなくなる** — `@typescript-eslint/typescript-estree` が新しい内部 API に対応しておらず、`eslint .` が即クラッシュする。
- pnpm の `overrides`（`"pkg@version>typescript": "..."` 形式の per-edge override）で typescript-eslint 系統だけ classic 版に固定しようと試みたが機能しなかった: このプロジェクトでは `typescript` パッケージ自体を通常の（exclusive な）devDependency として直接使っているため、peer dependency 解決はそちらを優先してしまい、override は黙って無視される（`strictPeerDependencies: false` のため警告も出ない）。回避するには workspace 全体の `typescript` そのものを classic 系に揃えるしかなかった。
- 将来 `typescript-eslint` が Native Preview に対応するまでは、`typescript` のバージョンを 7.x 系（Native Preview）に上げないこと。

## Windows でローカル e2e (`pnpm test:e2e`) が初回だけ止まることがある

- CI の `e2e` ジョブは GitHub Actions の `ubuntu-latest`（GUI なし、ヘッドレス）で動いており、OS のネットワーク許可ダイアログというものは原理的に存在しない。CI がスタックして見えたら、それは実際には Trystero がパブリックな Nostr リレー経由で WebRTC の P2P 接続を確立するのに時間がかかっている/失敗しているだけで、`room.spec.ts` / `room-random.spec.ts` の 60s タイムアウトに引っかかっているだけのことが多い（`e2e` ジョブは `continue-on-error: true` なので、これ自体はマージをブロックしない）。
- 一方、node を初めて実行する Windows マシンでローカルに `pnpm test:e2e` を実行すると、Playwright が起動する Vite dev サーバー（`playwright.config.ts` の `webServer`）が listen ソケットを開いた瞬間に Windows Defender ファイアウォールの確認ダイアログが出ることがある。ヘッドレス/無人実行だと誰もクリックできず、そのまま `webServer.timeout`（30s）で失敗する。`--host 127.0.0.1` を明示してループバック専用にしても、ネットワークプロファイルの設定次第ではダイアログが出るケースが残る。
- 出てしまった場合は一度だけ許可すれば以降は再発しない。無人環境（新規セットアップした自己ホストランナー等）で毎回止まるなら、事前に管理者権限の PowerShell で node.exe を許可しておく:
  ```powershell
  New-NetFirewallRule -DisplayName "Node.js (dev)" -Direction Inbound -Program "$(where.exe node)" -Action Allow
  ```

## React Compiler の有効化方法（@vitejs/plugin-react v6 以降）

- `@vitejs/plugin-react` は v6 で内部実装が oxc ベースに変わり、以前の `react({ babel: {...} })` オプションは廃止されている。渡してもビルドエラーになる。
- React Compiler は `reactCompilerPreset()`（同パッケージから export）を `@rolldown/plugin-babel` の `babel({ presets: [...] })` に渡す形で有効化する（`vite.config.ts` 参照）。`babel-plugin-react-compiler` 本体・`@babel/core`・`@types/babel__core` は変わらず必要。
