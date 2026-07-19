---
name: css-positioning
description: >-
  Use whenever writing CSS for overlays, badges, dropdowns, popovers, tooltips, or any element
  that needs to sit "on top of" or attached to another element. Establishes this project's
  preference for CSS Grid stacking and `transform` over `position: relative/absolute` +
  `top`/`left`/`right`/`bottom`, and documents the stacking-context gotcha: elements with
  `translate-*`/`transform`/`opacity<1` create a new stacking context that can silently hide
  later, non-stacking-context siblings regardless of DOM order — fixed with `isolate` on the
  sibling, not more positioning. Also covers the progressive-enhancement pattern for CSS features
  with inconsistent browser support (e.g. CSS anchor positioning): feature-detect via
  `CSS.supports(...)` and compute an equivalent fallback in JS, never degrade to something
  visually jarring like screen-centering.
---

# 原則

- (prefer) daisyUI によるプリセットクラスを素直に利用できるケースでは素直に利用し、以下の各種ルールを適用外としてもよい
  - 複雑なカスタマイズが必要になった段階でそれを避けることを検討する

# CSS Positioning Conventions

## Grid stacking over absolute positioning

`position: relative`（親）+ `position: absolute` + `top`/`left`/`right`/`bottom`（子）を利用するケースでは、以下の戦略が取れないかを検討する。

- **重ね合わせ**: 以下のどちらかを採用する。
  - 親を `grid grid-cols-* grid-rows-*` にし、重ねたい子要素がそれぞれ `{col,row}-{start,end}-*` を適切に設定する。同じグリッドセルに重なるので `absolute; inset: 0` と同じ効果が得られる。
  - 親を `relative` にし、子を `position: absolute` にするが `transform: translate(Xpx, Ypx)` を使う。
- **動的に計算する位置**: `top`/`left` を直接いじるのではなく、`transform: translate(Xpx, Ypx)` を使う。

## stacking context の落とし穴

Tailwind の `translate-*` や `transform`、`opacity`（1未満）を持つ要素は、たとえ値が実質的に無変化（`translate-0` 等）でも**独自の stacking context を作る**。同じ親の中で、stacking context を持たない後続の兄弟要素は、DOM 順に関わらずその要素の裏に隠れることがある。

実際にこのプロジェクトのセルバッジで発生した実例: `CellButton` の `translate-0` が原因で、DOM 上は後から描画されるはずのバッジ要素（メモ絵文字・他チームのクレーム表示）が完全に見えなくなっていた。座標もサイズも正しく、DOM 構造も意図通りだったため、見た目だけを見ていると原因が分かりにくい。

- **症状**: 要素は DOM 上に正しく存在し、`getBoundingClientRect()` の座標もサイズも正しいのに、画面上では見えない/クリックできない。
- **診断**: `document.elementFromPoint(x, y)` で実際にヒットする要素を調べ、期待した要素と一致するか確認する。一致しなければ stacking context の問題を疑う。スクリーンショットの見た目だけで「無い」と判断しない — DOM/ヒットテストで確認すること。
- **修正**: 隠れている側の要素に `isolate`（`isolation: isolate`）を付ける。`position` や `z-index` を追加する必要はない。

## Progressive enhancement: フォールバックは「同等の代替」であり「諦め」ではない

ブラウザ間でサポートが割れる CSS 機能（例: CSS anchor positioning = `anchor-name`/`position-anchor`/`anchor()`、Chromium 系のみ対応）を使う場合:

- `CSS.supports(property, value)` で機能検出する。`@supports` CSS ルールでも良いが、プロパティ単体の対応と実際に使う関数/構文の対応がズレる可能性があるため、実際に使う構文そのもの（例: `CSS.supports("top", "anchor(--x bottom)")`）でテストする方が確実。
- 非対応環境向けのフォールバックは、「画面中央に出す」のような投げやりな代替であってはならない。対象要素の `getBoundingClientRect()` から実際の位置を計算し、`transform: translate()` で同等の見た目（元の要素に隣接する、画面端ならフリップする、等）を再現する（例: `src/features/room/cell/CellClaimMenu.tsx`）。
