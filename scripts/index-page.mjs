/*
 * 一覧ページ（dist/index.html）の見た目。
 *
 * デッキと同じ地の上に置く。約束はデッキ側の styles/index.css と揃えてある。
 *   ・地は白の上に方眼紙。28px の薄い線と 140px の濃い線の二層
 *   ・アクセントは空色 1 色だけ。面は --c-accent、文字は --c-accent-ink
 *   ・見出しは英数字 Space Grotesk 700 + 和文 Murecho 900。同じ行で重さが違う
 *   ・数字は全部 Space Grotesk か Geist Mono。これがこの資料の見分け方
 *   ・角は丸めない（デッキのコードブロックに合わせる）
 *
 * 遊びは 2 つだけ。増やすと方眼の上が散らかる。
 *   1. カードに重なる連番。hover で空色に変わる
 *   2. j / k で選べる。キーボードだけで開ける
 */

/*
 * フッターに出すもの。portfolio / blog にも同じ内容を置いている
 * （リポジトリが別なので共有できない。増やすときは 3 箇所）。
 */
const SNS = [
  { label: 'X (Twitter)', href: 'https://x.com/papox_57', slug: 'x' },
  { label: 'GitHub', href: 'https://github.com/yabu1121', slug: 'github' },
  { label: 'Zenn', href: 'https://zenn.dev/yabu_p', slug: 'zenn' },
  { label: 'Speaker Deck', href: 'https://speakerdeck.com/hayato_1121', slug: 'speakerdeck', hidden: true },
  // simpleicons から LinkedIn は消えている（cdn.simpleicons.org/linkedin は 404）。
  // portfolio から持ってきた SVG を public/logos に置いて使う
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hayato-nasu-4aa1ba411', icon: '/logos/linkedin.svg', hidden: true },
  { label: 'Instagram', href: 'https://www.instagram.com/squ1_nh', slug: 'instagram' },
  { label: 'Wantedly', href: 'https://www.wantedly.com/id/hayato_nasu_c', slug: 'wantedly', hidden: true },
]

// 画面に出すもの。伏せたいものは hidden を付ける（URL は残しておきたい）
const VISIBLE_SNS = SNS.filter((l) => !l.hidden)

const iconFor = (l) => (l.slug ? `https://cdn.simpleicons.org/${l.slug}` : l.icon)

/*
 * 自前で配っている書体。public/fonts の woff2 がそのまま配られる。
 * どれも SIL OFL 1.1 で、再配布には著作権表示とライセンス本文が要る。
 */
const FONTS = ['Murecho', 'Space Grotesk', 'M PLUS 2', 'Geist Mono', 'JetBrains Mono']

const OFL_URL = 'https://openfontlicense.org/open-font-license-official-text/'

// ライセンス表記は 3 サイト分を portfolio の 1 枚にまとめている
const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? 'https://www.y4bu.net'

// 著作権表示の年。ビルド時刻に依らせない（焼かれた年で固定されるため）
const COPYRIGHT_YEAR = 2026

import { consentSnippet, insightsSnippet } from './consent-snippet.mjs'

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// サムネが無いデッキはタイトルの頭を置く。空の箱を並べるより紙らしい
const initials = (title) => escapeHtml(String(title).replace(/\s/g, '').slice(0, 2))

/*
 * 絞り込みの棚。デッキに付いているタグを本数の多い順に並べる。
 *
 * **ページは 1 枚のまま、表示/非表示で絞る。** 公開側は静的ビルドなので
 * タグごとのページを作ると枚数だけ HTML が増える。デッキは数十本の
 * 規模なので、全部を 1 枚に置いて JS で隠す方が速いし作りも単純。
 * 選んだタグは ?tag= に残すので、URL で共有できる。
 */
const tagBar = (decks) => {
  const count = new Map()
  for (const deck of decks) {
    for (const tag of deck.tags ?? []) count.set(tag, (count.get(tag) ?? 0) + 1)
  }
  if (!count.size) return ''

  const sorted = [...count].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))

  return `    <ul class="filters" id="filters">
      <li><button type="button" data-tag="" aria-pressed="true">ALL<span class="count">${decks.length}</span></button></li>
${sorted
  .map(
    ([tag, n]) =>
      `      <li><button type="button" data-tag="${escapeHtml(tag.toLowerCase())}" aria-pressed="false">${escapeHtml(tag)}<span class="count">${n}</span></button></li>`,
  )
  .join('\n')}
    </ul>`
}

const card = (deck) => {
  const thumb = deck.hasThumb
    ? `<img src="/thumbs/${deck.slug}.png" alt="" loading="lazy">`
    : `<span class="initials" aria-hidden="true">${initials(deck.title ?? deck.slug)}</span>`

  // 絞り込みに使うので、タグを小文字にして data に持たせる
  const data = escapeHtml((deck.tags ?? []).map((t) => t.toLowerCase()).join('\n'))

  return `      <li data-tags="${data}">
        <a class="card" href="/${deck.slug}/">
          <span class="thumb">${thumb}</span>
          <span class="body">
            <span class="title">${escapeHtml(deck.title ?? deck.slug)}</span>
            <span class="meta">
              ${deck.date ? `<time datetime="${escapeHtml(deck.date)}">${escapeHtml(deck.date.replace(/-/g, '.'))}</time>` : ''}
              ${deck.event ? `<span class="event">${escapeHtml(deck.event)}</span>` : ''}
            </span>
          ${(deck.tags ?? []).length
            ? `<span class="tags">${deck.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</span>`
            : ''}
          </span>
          <span class="arrow" aria-hidden="true">→</span>
        </a>
      </li>`
}

export const renderIndex = (decks) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slides</title>
<meta name="description" content="発表資料の置き場">

<!--
  SNS に貼ったときの見え方。**画像は焼いたものを置く。**
  www と blog は Next がその場で描けるが、ここは静的なので
  scripts/make-og.mjs で 1 枚作って public/og に置いてある。
-->
<meta property="og:type" content="website">
<meta property="og:site_name" content="y4bu.net">
<meta property="og:title" content="スライド">
<meta property="og:description" content="発表資料の置き場">
<meta property="og:image" content="https://slides.y4bu.net/og/og.png">
<meta property="og:url" content="https://slides.y4bu.net/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/icon-192.png">
<link rel="stylesheet" href="/fonts.css">
<style>
:root {
  --c-bg: #ffffff;
  --c-ink: #16191d;
  --c-ink-2: #4b5563;
  --c-ink-3: #8b949e;
  --c-border: #e4e7eb;
  --c-accent: #5bc5e8;
  --c-accent-ink: #1b7ea3;
  --c-accent-soft: #e6f6fc;
  --c-accent-deep: #2aa4cd;
  --c-grid: #f3f9fc;
  --c-grid-strong: #e8f3f9;
  --c-cover-band: #cbe9f5;
  --font-sans: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Hiragino Sans",
    "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
  --font-display: "Space Grotesk", "Murecho", "M PLUS 2", -apple-system, "Hiragino Sans", sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  color-scheme: light;
}

* { box-sizing: border-box; }

/* 地。デッキと同じ方眼紙 */
/*
 * 縦の flex にして .wrap を伸ばす。これでデッキが少なくても
 * フッターが画面の一番下に着く。
 * 下の余白（以前の padding-bottom: 120px）はフッターが受け持つ。
 */
body {
  margin: 0;
  padding: 0 20px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: var(--c-ink);
  font-family: var(--font-sans);
  line-height: 1.75;
  background-color: var(--c-bg);
  background-image:
    linear-gradient(var(--c-grid-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--c-grid-strong) 1px, transparent 1px),
    linear-gradient(var(--c-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--c-grid) 1px, transparent 1px);
  background-size: 140px 140px, 140px 140px, 28px 28px, 28px 28px;
}

/* 表紙の外周の帯を上辺だけ借りる */
body::before {
  content: "";
  position: fixed; inset: 0 0 auto 0; height: 6px; z-index: 2;
  background: linear-gradient(90deg, var(--c-cover-band), var(--c-accent), var(--c-cover-band));
}

/*
 * 面の幅。**一覧とフッターで同じ値を使う。**
 * デッキを横に 6 枚並べたいので、820px から広げてある。
 *
 * **width: 100% が要る。** body を縦の flex にしたので、margin: 0 auto を
 * 持つ子は交差軸で伸びず、中身なりの幅（実測 532px）に縮んでいた。
 * 100% で一度いっぱいに広げてから max-width で止める。
 */
:root { --w: 1240px; }
.wrap { width: 100%; max-width: var(--w); margin: 0 auto; flex: 1 0 auto; }

/* ---- 表題 ------------------------------------------------------- */
header { position: relative; padding: 96px 0 56px; }

/* マスコット。表題の右に 1 つだけ。増やすと方眼の上が散らかる */
header .mascot { position: absolute; right: 0; top: 76px; width: 96px; height: auto; }
@media (max-width: 560px) { header .mascot { width: 68px; top: 40px; } }

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(40px, 9vw, 68px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
}
h1 .jp { font-weight: 900; font-size: 0.42em; letter-spacing: 0.04em; display: block; margin-top: 10px; color: var(--c-ink-2); }

/* ---- カード ----------------------------------------------------- */
/*
 * **横 1 列ではなく格子に並べる。** デッキは増える前提なので、1 本ずつ
 * 横長に置くと数が増えるほど画面を送るだけになる。
 * 1 枚の幅は 240px から。入るだけ並べて、余りは伸ばす。
 */
ul { list-style: none; margin: 0; padding: 0; }
#decks {
  display: grid;
  /* 1 枚 170px から。面が 1240px なので広い画面で 6 枚並ぶ */
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 20px 14px;
}

.card {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  /* 枠も地も置かない。表紙そのものが枠の代わりになる */
  transition: transform .18s;
}
.card:hover, .card:focus-visible, .card.is-active { outline: none; }


.thumb {
  display: grid; place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--c-bg);
  background-image:
    linear-gradient(var(--c-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--c-grid) 1px, transparent 1px);
  background-size: 28px 28px, 28px 28px;
  border: 1px solid var(--c-border);
  transition: border-color .18s;
}
.card:hover .thumb, .card:focus-visible .thumb, .card.is-active .thumb { border-color: var(--c-accent); }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s ease; }
.card:hover .thumb img, .card.is-active .thumb img { transform: scale(1.03); }
.initials {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 18px;
  color: var(--c-accent);
  letter-spacing: 0.02em;
}

.body { min-width: 0; }
.title {
  display: block;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 13px;
  line-height: 1.5;
  /* 長い表題は 2 行で止める。格子の高さが揃わなくなるため */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color .18s;
}
.card:hover .title, .card:focus-visible .title, .card.is-active .title { color: var(--c-accent-ink); }
.meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px;
  margin-top: 5px;
  font-size: 11px;
  color: var(--c-ink-3);
}
.meta time { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.event {
  padding: 1px 6px;
  background: var(--c-accent-soft);
  color: var(--c-accent-ink);
  font-size: 10px;
}

/* 矢印は出さない。格子では 1 枚ずつに付けると点が散らかる */
.arrow { display: none; }

/* ---- タグ -------------------------------------------------------- */
/* 囲いは付けない。格子では 1 枚ずつに箱が増えて散らかる */
.tags { display: flex; flex-wrap: wrap; gap: 2px 8px; margin-top: 6px; }
.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--c-ink-3);
}

/* 絞り込みの棚。押した 1 つだけが効く。もう一度押すと全部に戻る */
/*
 * **囲いは付けない。** blog の絞り込みと同じ見せ方。
 * 現在地は色と下の芯だけで示す。
 */
.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 20px; margin: 0 0 20px; padding: 0; list-style: none; }
.filters button {
  position: relative;
  border: 0;
  background: none;
  padding: 4px 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--c-ink-3);
  cursor: pointer;
  transition: color 0.15s;
}
.filters button:hover { color: var(--c-accent-ink); }
.filters button[aria-pressed="true"] { color: var(--c-accent-ink); }
.filters button[aria-pressed="true"]::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  background: var(--c-accent);
}
.filters .count { margin-left: 6px; color: var(--c-ink-3); }
#decks li[hidden] { display: none; }
.empty { margin: 0 0 24px; font-family: var(--font-mono); font-size: 12px; color: var(--c-ink-3); }

/* ---- フッター ---------------------------------------------------- */
/*
 * portfolio / blog と同じ並び。3 サイトの行き先・外部リンク・書体の表示。
 * 書体は public/fonts に woff2 を置いて自前配布しているので、名前と
 * ライセンスを出すのは **義理ではなく条件**（SIL OFL 2 項）。
 */
/*
 * 方眼は body の背景画像。ここに背景色を敷いてフッターだけ白無地にする
 * （portfolio と同じ地）。
 * 地は画面幅いっぱいに敷きたいので、body の左右 20px を負のマージンで
 * 打ち消して全幅にし、中身は .inner で 820px に戻している。
 */
footer.site { margin: 96px -20px 0; border-top: 1px solid var(--c-border); padding: 48px 20px; background: var(--c-bg); }
footer.site .inner { max-width: var(--w); margin: 0 auto; }
footer.site .cols { display: grid; gap: 56px; grid-template-columns: 1fr auto auto; }
footer.site h2 { margin: 0; font-family: var(--font-mono); font-size: 10px; font-weight: 400; letter-spacing: 0.1em; color: var(--c-ink-3); }
footer.site .who p:first-child { margin: 0; font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
footer.site .who p:last-child { margin: 8px 0 0; max-width: 20rem; font-size: 13px; line-height: 1.625; color: var(--c-ink-2); }
footer.site ul { margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
footer.site a { color: inherit; text-decoration: none; font-size: 13px; display: flex; align-items: center; gap: 8px; }
footer.site a:hover { color: var(--c-accent-ink); }
footer.site a img { width: 13px; height: 13px; opacity: 0.45; transition: opacity 0.15s; }
footer.site a:hover img { opacity: 1; }
footer.site .legal { margin-top: 48px; border-top: 1px solid var(--c-border); padding-top: 20px; display: flex; flex-wrap: wrap; gap: 8px 24px; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; line-height: 1.625; letter-spacing: 0.025em; color: var(--c-ink-3); }
footer.site .legal p { margin: 0; }
footer.site .legal a { display: inline; font-size: inherit; text-decoration: underline; }
@media (max-width: 640px) {
  footer.site .cols { grid-template-columns: 1fr; gap: 40px; }
  footer.site .elsewhere ul { grid-template-columns: 1fr 1fr; gap: 8px 24px; }
}

/* ---- 遊び 3 のヒント -------------------------------------------- */
.hint {
  margin: 44px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--c-ink-3);
}
.hint kbd {
  padding: 1px 5px;
  border: 1px solid var(--c-border);
  background: var(--c-bg);
  font: inherit;
}

@media (max-width: 640px) {
  header { padding: 64px 0 40px; }
  header svg { display: none; }
  /* 格子は auto-fill なので列は勝手に減る。ここでは 2 列を保証するだけ */
  #decks { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 12px; }
  .hint { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
  .card:hover, .card.is-active { transform: none; }
}
/* ---- 上の帯 ------------------------------------------------------ */
/*
 * www / blog / admin と同じ形。行き先は引き出しに畳み、帯に出すのは
 * いまどこにいるかだけ。横に並べると、サイトごとに数が違って
 * 「同じ帯」に見えない。
 */
.band { height: 6px; background: linear-gradient(90deg, var(--c-accent-soft), var(--c-accent), var(--c-accent-soft)); }

.topbar {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--c-line);
  background: color-mix(in srgb, var(--c-bg) 90%, transparent);
  backdrop-filter: blur(8px);
}
.topbar .burger {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; padding: 0;
  border: 1px solid var(--c-line); background: var(--c-bg);
  color: var(--c-ink-2); cursor: pointer; transition: color .15s, border-color .15s;
}
.topbar .burger:hover { border-color: var(--c-accent); color: var(--c-accent-ink); }
.topbar .burger span { position: relative; display: block; width: 16px; height: 9px; }
.topbar .burger i { position: absolute; left: 0; right: 0; height: 1px; background: currentColor; }
.topbar .burger i:nth-child(1) { top: 0; }
.topbar .burger i:nth-child(2) { top: 4px; }
.topbar .burger i:nth-child(3) { top: 8px; }
.topbar .mark { font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -0.01em; color: var(--c-ink); text-decoration: none; }
.topbar .here { font-family: var(--font-mono); font-size: 11px; color: var(--c-ink-3); }

#veil { position: fixed; inset: 0; z-index: 40; border: 0; padding: 0; background: color-mix(in srgb, var(--c-ink) 20%, transparent); cursor: pointer; }
#veil[hidden] { display: none; }

#drawer {
  position: fixed; inset-block: 0; left: 0; z-index: 50;
  display: flex; flex-direction: column;
  width: 240px; overflow-y: auto;
  border-right: 1px solid var(--c-line); background: var(--c-bg);
  transform: translateX(-100%); transition: transform .2s;
}
#drawer.is-open { transform: translateX(0); }
#drawer .head { display: flex; align-items: center; gap: 12px; padding: 24px 20px 20px; }
#drawer .head a { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--c-ink); text-decoration: none; }
/* 当たり判定を広げる。文字のままだと 13px 四方しか押せない */
#drawer .head button { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; margin-left: auto; border: 0; background: none; font-family: var(--font-mono); font-size: 15px; color: var(--c-ink-3); cursor: pointer; }
#drawer ul { margin: 0; padding: 0 12px; list-style: none; }
#drawer li a { display: block; padding: 8px 12px; font-size: 14px; color: var(--c-ink-2); text-decoration: none; transition: color .15s; }
#drawer li a:hover { color: var(--c-accent-ink); }
#drawer li a[aria-current="page"] { background: var(--c-accent-soft); color: var(--c-accent-ink); font-weight: 900; }
#drawer .sites { margin-top: auto; border-top: 1px solid var(--c-line); padding: 20px 24px; }
#drawer .sites p { margin: 0; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; color: var(--c-ink-3); }
#drawer .sites ul { margin-top: 10px; padding: 0; }
#drawer .sites a { padding: 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: var(--c-ink-3); }
</style>
</head>
<body>
  <div class="band"></div>

  <header class="topbar">
    <button type="button" class="burger" id="burger" aria-label="メニューを開く" aria-expanded="false">
      <span aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
    <a class="mark" href="/">slides</a>
    <nav class="here" aria-label="現在地">/ 一覧</nav>
  </header>

  <button type="button" id="veil" aria-label="メニューを閉じる" hidden></button>

  <nav id="drawer" inert>
    <div class="head">
      <a href="/">slides</a>
      <button type="button" id="drawer-close" aria-label="メニューを閉じる">✕</button>
    </div>
    <ul>
      <li><a href="/" aria-current="page">一覧</a></li>
    </ul>
    <div class="sites">
      <p>OTHER SITES</p>
      <ul>
        <li><a href="${PORTFOLIO_URL}">portfolio ↗</a></li>
        <li><a href="https://blog.y4bu.net">blog ↗</a></li>
      </ul>
    </div>
  </nav>

  <div class="wrap">
    <header>
      <img class="mascot" src="/mascot/pose-flying.webp" alt="" width="96" height="96" loading="eager">
      <h1>Slides<span class="jp">発表資料の置き場</span></h1>
    </header>

${tagBar(decks)}
    <ul id="decks">
${decks.map((deck) => card(deck)).join('\n')}
    </ul>

    <p class="empty" id="empty" hidden>このタグのスライドはありません</p>

    <div class="tail"><img src="/mascot/pose-celebrate.webp" alt="" width="96" height="96" loading="lazy"></div>

    <p class="hint"><kbd>j</kbd> <kbd>k</kbd> で選ぶ・<kbd>Enter</kbd> で開く</p>
  </div>

    <footer class="site">
      <div class="inner">
      <div class="cols">
        <div class="who">
          <p>y4bu.net</p>
          <p>作ったもの・書いたもの・話したものの置き場です。</p>
        </div>

        <nav>
          <h2>SITES</h2>
          <ul>
            <li><a href="https://www.y4bu.net">portfolio</a></li>
            <li><a href="https://blog.y4bu.net">blog</a></li>
            <li><a href="/">slides</a></li>
          </ul>
        </nav>

        <nav class="elsewhere">
          <h2>ELSEWHERE</h2>
          <ul>
${VISIBLE_SNS.map((l) => `            <li><a href="${l.href}" target="_blank" rel="me noreferrer"><img src="${iconFor(l)}" alt="" width="13" height="13" loading="lazy">${l.label}</a></li>`).join('\n')}
          </ul>
        </nav>
      </div>

      <div class="legal">
        <p>© ${COPYRIGHT_YEAR} hayato</p>
        <p>Fonts: ${FONTS.join(' / ')} — <a href="${OFL_URL}" target="_blank" rel="noreferrer">SIL Open Font License 1.1</a> · <a href="${PORTFOLIO_URL}/licenses">ライセンス</a> · <a href="${PORTFOLIO_URL}/privacy">cookie</a></p>
      </div>
      </div>
    </footer>

<script>
  // 上の帯の引き出し。www / blog / admin と同じ振る舞い
  const burger = document.getElementById('burger')
  const drawer = document.getElementById('drawer')
  const veil = document.getElementById('veil')

  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open)
    // 閉じているときは inert。画面の外に出しているだけなので、Tab で入れてしまう
    if (open) drawer.removeAttribute('inert')
    else drawer.setAttribute('inert', '')
    veil.hidden = !open
    burger.setAttribute('aria-expanded', String(open))
  }

  burger.addEventListener('click', () => setOpen(true))
  veil.addEventListener('click', () => setOpen(false))
  document.getElementById('drawer-close').addEventListener('click', () => setOpen(false))

  // 遊び 3。キーボードだけで開ける。マウスを触っている間は邪魔をしない
  const cards = [...document.querySelectorAll('#decks .card')]
  let at = -1

  const move = (step) => {
    at = Math.max(0, Math.min(cards.length - 1, at < 0 ? 0 : at + step))
    cards.forEach((c, i) => c.classList.toggle('is-active', i === at))
    cards[at].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter' && at >= 0) cards[at].click()
    else if (e.key === 'Escape') { setOpen(false); at = -1; cards.forEach((c) => c.classList.remove('is-active')) }
  })

  /*
   * タグの絞り込み。選んだタグを持つ li だけ残す。
   * 選んだものは ?tag= に残すので、URL をそのまま渡せる。
   */
  const filters = document.getElementById('filters')
  if (filters) {
    const items = [...document.querySelectorAll('#decks > li')]
    const empty = document.getElementById('empty')

    const apply = (tag) => {
      let shown = 0
      for (const li of items) {
        // data-tags は小文字の改行区切り。部分一致を避けるため行で比べる
        const has = !tag || (li.dataset.tags || '').split('\\n').includes(tag)
        li.hidden = !has
        if (has) shown++
      }
      empty.hidden = shown > 0
      for (const b of filters.querySelectorAll('button')) {
        b.setAttribute('aria-pressed', String(b.dataset.tag === tag))
      }
      // 隠れたカードが選ばれたままにならないよう、キーボードの選択は解除する
      at = -1
      cards.forEach((c) => c.classList.remove('is-active'))
    }

    filters.addEventListener('click', (e) => {
      const button = e.target.closest('button')
      if (!button) return
      // 同じものをもう一度押したら解除
      const next = button.getAttribute('aria-pressed') === 'true' ? '' : button.dataset.tag
      const url = new URL(location.href)
      if (next) url.searchParams.set('tag', next)
      else url.searchParams.delete('tag')
      history.replaceState(null, '', url)
      apply(next)
    })

    const initial = (new URLSearchParams(location.search).get('tag') || '').toLowerCase()
    // URL に知らないタグが入っていたら全部出す
    if (initial && filters.querySelector('button[data-tag="' + CSS.escape(initial) + '"]')) apply(initial)
  }

  // マウスで触ったらキーボードの選択は解除する。2 つ光っていると分からない
  cards.forEach((c, i) => c.addEventListener('mouseenter', () => {
    at = i
    cards.forEach((x, j) => x.classList.toggle('is-active', j === i))
  }))
</script>
${consentSnippet({ kind: 'page', target: 'slides:/' })}
${insightsSnippet()}
</body>
</html>
`
