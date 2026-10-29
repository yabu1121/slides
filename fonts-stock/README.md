# フォントのストック

いつか使いたいフォントの控え。**ここに置いただけでは効かない。**
使うときは下の手順で `public/fonts/` に移してから、`styles/index.css` の
`--font-display` を書き換える。

## いま使っているもの

| 用途 | フォント | 入手元 |
| --- | --- | --- |
| 見出し・英数字 | Space Grotesk | Google Fonts（OFL） |
| 見出し・日本語 | M PLUS 2 | Google Fonts（OFL） |
| 見出し・日本語（控え） | Zen Maru Gothic | Google Fonts（OFL） |
| 本文 | 端末のフォント（Hiragino Sans ほか） | ダウンロードしない |

## 使ってみたい候補

いずれも配布元が個別で、ライセンスも個別。**自動で落としていない。**
使う前に配布元のページで利用条件を確認して、手で入れる。

| フォント | 系統 | 配布元 / ライセンス |
| --- | --- | --- |
| 鳩とブリキのワンダランド | 手書き・味のある丸み | 未確認 |
| しかくふと | 角ゴシック・太め | 未確認 |
| ドーナツショップ | ポップ・丸み | 未確認 |
| クラムボン | 手書き・やわらかい | 未確認 |
| ゾウフォント | 手書き・太め | 未確認 |
| ひょうきんな！？ | ポップ・不揃い | 未確認 |
| コーポレートラウンド | 角ゴシック・丸角 | 未確認 |
| オーグジュアリ | ディスプレイ | 未確認 |
| イマジンヨコハマ | ディスプレイ | 未確認 |
| 雨降りドロップス | 手書き・やわらかい | 未確認 |

配布元とライセンスは埋めていく。Web フォント配布が禁止のものは、
スライドを配らず自分の端末だけで使うか、PDF に書き出して使う。

## 入れ方

### 1. ファイルを置く

`fonts-stock/<フォント名>/` に配布物をそのまま置く。
`LICENSE` や `README` も一緒に残す。あとで条件を確認するため。

### 2. Web フォントにする

`.ttf` や `.otf` のままだと重いので `.woff2` に変換する。

```bash
npm i -g woff2            # 初回だけ
woff2_compress path/to/Font.ttf
```

できた `.woff2` を `public/fonts/` に置く。

### 3. 宣言を足す

`styles/fonts.css` の末尾に足す。

```css
@font-face {
  font-family: 'フォント名';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/fonts/ファイル名.woff2) format('woff2');
}
```

### 4. 使う

`styles/index.css` の `--font-display` の先頭に足す。

```css
--font-display: "フォント名", "Space Grotesk", "M PLUS 2", sans-serif;
```

日本語フォントは英数字が弱いことが多い。
英数字は Space Grotesk に任せて、日本語だけ差し替えるのが無難。

## Google Fonts から足す場合

配布元が Google Fonts なら変換はいらない。

```bash
# 1. Chrome の User-Agent で CSS を取る（woff2 で返ってくる）
curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=<名前>&display=swap"

# 2. 中の fonts.gstatic.com の URL を public/fonts/ に落とす
# 3. URL を /fonts/<ファイル名> に書き換えて styles/fonts.css の末尾に足す
```

日本語フォントは文字数が多く、100 以上のファイルに分かれる。全部落とす。
