# イラスト素材の置き場

フリー素材をここに置いて、`<Illust src="/illust/ファイル名" />` で呼ぶ。

```md
<Illust src="/illust/meeting.png" />          右端・上下中央に 260px
<Illust src="/illust/meeting.png" :w="320" /> 幅を変える
<Illust src="/illust/meeting.png" inline />   その場に流し込む
```

## どこから取るか

**Loose Drawing** <https://loosedrawing.com/>

- 無料。商用利用可。クレジット表記は不要
- 線だけのゆるいイラストなので、このテンプレートの線と相性がよい
- 無料版は PNG。SVG は有料

## 守ること

- **素材をリポジトリにコミットしない。**
  規約でイラスト自体の再配布が禁止されている。リポジトリを公開するなら
  `.gitignore` で除外したままにする。配布するのは書き出した PDF や HTML だけ
- 著作権は配布元にある。加工はしてよいが、素材そのものを売らない
- **1 枚のスライドに 1 点まで**
- 幅は 260〜360px。小さくしない。地が方眼紙なので線が干渉する
- 素材は黒い線と黄色の 2 色。`Illust` が既定で色相をずらして空色に寄せる。
  黄色のまま出したいときだけ `raw` を付ける

## 一覧を見る

`slides.md` の「素材一覧」のページ。このフォルダを読んで自動で並ぶので、
ファイルを置くだけでそこに出る。

## いま入っているもの

技術の発表でよく使うものを 54 点落としてある。足りなければ
サイトから足す。使わない素材を増やさない。

- `analysis`
- `ask-ai`
- `big-small`
- `board-computer`
- `cable`
- `cafe`
- `cafe-work`
- `chart-donut`
- `chart-down`
- `chart-line-bar`
- `choose`
- `clock`
- `coding`
- `coffee-pc-man`
- `coffee-pc-woman`
- `connect-devices`
- `conversation`
- `data-forecast`
- `data-mess`
- `data-organize`
- `demo-man`
- `demo-pc`
- `demo-woman`
- `error-404`
- `error-trouble`
- `file-share`
- `gather-info`
- `gather-struggle`
- `group-work`
- `handshake`
- `help-each-other`
- `hot-drink`
- `internet`
- `laptop-internet`
- `maintenance`
- `memory`
- `multi-device`
- `network-cloud`
- `os`
- `pitch-chart`
- `praise`
- `presentation`
- `research`
- `research-pc`
- `satellite`
- `search`
- `server-cable`
- `server-room`
- `shop-talk`
- `smartwatch`
- `sofa-remote`
- `stacking-team`
- `storage`
- `win-lose`

## 名前の付け方

用途が分かる短い名前にする。`meeting.png` `thinking.png` `deploy.png` など。
日本語のファイル名は使わない。
