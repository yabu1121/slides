# Slidev テンプレート

自分用の Slidev テンプレート。名刺から取った**白地に薄い空色の方眼紙**が全ページの地。
`slides.md` の中身を差し替えて使う。書き方は各ページのコメントブロックに書いてある。

## 使い方

```bash
npm install
npm run dev:site                              # サイト全体（一覧 + 各デッキ）
npm run dev -- portfolio-infrastructure.md    # デッキ 1 枚を書くとき
npm run build                                 # 全デッキを dist/ に出力
npm run thumbs                                # 一覧用サムネイルを作る
npm run export -- portfolio-infrastructure.md # PDF 出力（下記の準備が必要）
```

## デッキを増やす

ルート直下の `.md` が 1 枚 1 デッキ。`slides.md` を複製して名前を付ければ、
ビルドも一覧も自動で拾う。`package.json` に手を入れる必要はない。

公開先は `slides.y4bu.net/<ファイル名>/`。frontmatter で一覧の見え方が決まる。

| キー | 役割 |
| --- | --- |
| `title` | カードの見出し。無ければファイル名 |
| `date` | `2026-10-27` 形式。新しい順に並ぶ |
| `event` | 発表した場所。無ければ出さない |
| `draft` | `true` ならビルドも一覧もしない（非公開）。`false` と読める値以外は非公開扱い |

非公開にしたいデッキは `draft: true` を付ける。静的ファイルなので、置いた時点で
URL を知っている人には見えてしまう。一覧から隠すだけでは不十分。

`.md` を触らずに公開/非公開を切り替えたいときは admin（admin.y4bu.net）の
スライドのタブを使う。判定は「`.md` の `draft` が強い → それ以外は DB の
`published` に従う」。admin のトグルは slides の再ビルドを起こして反映される。

### 手元で公開トグルの挙動を確認する

本番は `admin のトグル → Vercel の Deploy Hook → 再ビルド` の流れ。
手元では `npm run dev:site` の `POST /__rebuild` が同じ役割をするので、
admin の `.env.local` をここに向ければ通しで確認できる。

```
SLIDES_DEPLOY_HOOK_URL=http://localhost:3030/__rebuild
```

実測で、トグルから 3 秒ほどで `/<slug>/` が 404 になり一覧からも消える。

サムネイルは `thumbs/<ファイル名>.png` を見る。`npm run thumbs` で作ってコミットする。
ビルド側はコピーするだけなので、Vercel 上でブラウザを用意しなくて済む。

## 構成

| path | 役割 |
| --- | --- |
| `slides.md` | スライド本体。書き方はこのファイル内のコメントに書いてある |
| `scripts/build-all.mjs` | 全デッキをビルドし、一覧ページを生成する |
| `scripts/index-page.mjs` | 一覧ページの見た目。デッキ側のトークンに合わせてある |
| `scripts/thumbs.mjs` | 一覧用サムネイル（`thumbs/<slug>.png`）を作る |
| `scripts/serve-site.mjs` | 本番と同じ形（一覧 + 各デッキ）を手元で配信する。`.md` を触ると作り直す。`POST /__rebuild` で明示的に作り直す（admin のトグルの確認用） |
| `scripts/deck-visibility.mjs` | 公開設定（`slides.decks`）と突き合わせる。admin のトグルはここで効く |
| `vercel.json` | ビルド設定と SPA フォールバック |
| `CLAUDE.md` | AI 向けのルール（`AGENTS.md` は同じ内容） |
| `components/Arch*.vue` | アーキテクチャ図。`Arch` `ArchGroup` `ArchNode` `ArchLink` |
| `styles/index.css` | デザイントークン（色・余白・文字）と全体スタイル |
| `MEMO.md` | AI 側の判断で決めた所の一覧。壁打ち待ち |
| `global-top.vue` | 全ページに重なる層。いまはページ番号だけ |
| `components/Chart.vue` | グラフ。ECharts を資料の配色と字で包んだもの |
| `components/chart-theme.ts` | グラフの配色と軸。色はここに集約 |
| `components/Illust.vue` | 本文ページに差し込む線画 |
| `setup/mermaid.ts` | Mermaid の配色（シーケンス図・状態遷移図） |
| `setup/shiki.ts` | コードの色 |
| `uno.config.ts` | `icon` 属性からアイコンを拾う UnoCSS 設定 |
| `public/` | 画像などの静的ファイル。`/foo.png` で参照 |
| `public/diagrams/` | draw.io から書き出した SVG の置き場 |
| `public/fonts/` | 見出し用フォントの実体（自前配信） |
| `fonts-stock/` | 使ってみたいフォントの控えと入れ方 |
| `cover-art/` | 表紙の図案の控え（山 / 街並み）。貼り替えて使う |
| `public/illust/` | フリーイラスト素材の置き場。**コミットしない** |
| `styles/fonts.css` | 見出し用フォントの @font-face 定義 |

## 発表ごとのファイル

`slides.md` はテンプレート本体。**実際の発表は別ファイルに作る。**

```bash
npm run dev:dbms      # dbms.md を開く
npx slidev 任意.md     # 新しい発表はこの形で
```

`components/` `styles/` は置き場所に関係なく効くので、
発表ファイルはリポジトリ直下に置けばよい。

| file | 中身 |
| --- | --- |
| `slides.md` | テンプレート本体。型の見本 |
| `dbms.md` | テック文化祭 LT「DBMS、キモくね？」 |

## 入っている型

| 章 | 中身 |
| --- | --- |
| 自己紹介 | 名刺のレイアウトを 1 枚に |
| 文字 | 大きさ 7 段階 / 箇条書き / 表 / 強調と引用 |
| 発表の型 | 前提・課題・タイムライン・比較・改善・逆説・結果・手順・まとめ・トレードオフ・デモ・参考資料・質疑 |
| 分析 | グラフ 18 種類。**この章だけ緑基調** |
| コード | ハイライト / 吹き出しの説明 / 書き換え（magic-move） |
| アーキテクチャ | AWS の構成図 6 種類 + シーケンス図 + 状態遷移図 |
| 補足 | 質疑で聞かれたときだけ開くページ |

最後に締めのページ。`class: ending` を付けるとページ番号が消える。

## グラフ

`Chart` に ECharts の option を渡す。**色と字は書かない。**
色を指定したいときは `'slate'` `'green'` のような**名前**で書く。
実際の色は `components/chart-theme.ts` が CSS 変数から取る。

```md
<script setup>
const option = {
  xAxis: { type: 'category', data: ['A', 'B'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [10, 20] }],
}
</script>

<div class="u-bleed"><Chart :option="option" :h="326" /></div>
```

## アーキテクチャ図

座標はグリッド単位で指定する。**線は水平か垂直しか引けず**、ネットワーク境界は必ず長方形になる。
アイコンは AWS 65 種類がオフラインで使える。

細かく手で描きたい図は draw.io で作り、SVG に書き出して `public/diagrams/` に置く。
draw.io 側では Edge style を Orthogonal にしておく。

## テーマ色の変更

`styles/index.css` の `:root` にある `--c-accent` 系の 3 変数を書き換える。
分析セクションだけ別の配色（`--c-a-*`）を持っている。

Mermaid とコードの色は CSS 変数を読めないので、
`setup/mermaid.ts` と `setup/shiki.ts` に別で持っている。**変えるときは一緒に直す。**

## MEMO

コメントの中の `MEMO:` は、人間が決めたことではなく AI 側の判断で置いた所の印。

```bash
grep -rn "MEMO:" slides.md components setup global-top.vue
```

一覧と背景は `MEMO.md`。決まったら印を消す。**印が残っている = まだ決まっていない。**

## PDF 出力の準備

`npm run export` には Playwright のブラウザ本体が必要。初回のみ次を実行する。

```bash
npm install-scripts approve playwright-chromium && npm install
```
