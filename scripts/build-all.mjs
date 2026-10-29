/*
 * デッキを全部ビルドして dist/ にまとめ、トップに一覧ページを作る。
 *
 * ルート直下の .md が 1 枚 1 デッキ。足せば自動で拾われるので、
 * package.json にスクリプトを増やす必要はない。
 *
 *   frontmatter で見える情報
 *     title ... カードの見出し。無ければファイル名
 *     date  ... 2026-10-27 形式。新しい順に並ぶ
 *     event ... 発表した場所。無ければ出さない
 *     draft ... true ならビルドも一覧もしない（**.md 側が強い**）
 *
 * 公開するかどうかの最終判断は DB（slides.decks）と突き合わせて決める。
 * admin のトグルがそこを倒す。詳細は scripts/deck-visibility.mjs。
 *
 * サムネイルは thumbs/<slug>.png を置いておけば使われる。
 * 作るのは scripts/thumbs.mjs。ここでは生成しない（ビルド環境に
 * ブラウザを要求しないため）。
 */

import { execFileSync } from 'node:child_process'
import { existsSync, cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { renderIndex } from './index-page.mjs'
import { consentSnippet, insightsSnippet } from './consent-snippet.mjs'
import { parse } from '@slidev/parser'
import { resolveVisibility } from './deck-visibility.mjs'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const SLIDEV = join(ROOT, 'node_modules', '.bin', 'slidev')

// デッキではない .md（説明書きの類）
const NOT_DECKS = new Set(['README.md', 'CLAUDE.md', 'AGENTS.md', 'MEMO.md'])

/*
 * 雛形。新しいデッキを作るときに複製する見本集で、全レイアウトの書き方が入っている。
 * デッキとしてビルドはするが、**最初は非公開で登録する**（見本がいきなり本番に
 * 出るのは意図と違う）。見たくなったら admin で倒す。
 */
const TEMPLATE = 'slides.md'

/*
 * frontmatter を読む。draft の判定が公開/非公開を決めるので、
 * 迷ったら「非公開」に倒す（読めなかったものを公開してしまう方が事故が大きい）。
 */
const readFrontmatter = (file) => {
  // BOM 付きで保存されていると ^--- に当たらないため先に落とす
  const text = readFileSync(join(ROOT, file), 'utf8').replace(/^\uFEFF/, '')

  if (!/^---\r?\n/.test(text)) return { __frontmatter: 'none' }

  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return { __frontmatter: 'broken' }

  const out = { __frontmatter: 'ok' }
  for (const line of block[1].split(/\r?\n/)) {
    // 行頭のキーだけ拾う。shiki: や fonts: の下の入れ子は無視される
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const value = kv[2]
      .replace(/\s+#.*$/, '') // 行末コメント
      .trim()
      .replace(/^['"]|['"]$/g, '')
    if (value) out[kv[1]] = value
  }

  // 取りこぼし検知。draft: と書いてあるのに拾えていなければ非公開側に倒す
  if (/^\s*draft\s*:/m.test(block[1]) && out.draft === undefined) out.draft = 'unparsed'

  return out
}

// false と読めるものだけが公開。true/True/yes/1 も、解釈できない値も非公開
const FALSEISH = new Set(['false', 'no', 'n', '0', 'off'])

const isDraft = (deck) => {
  if (deck.__frontmatter === 'broken') {
    console.warn(`  ${deck.file}: frontmatter を読めないため非公開として扱います`)
    return true
  }
  if (deck.draft === undefined) return false
  const value = String(deck.draft).trim().toLowerCase()
  if (FALSEISH.has(value)) return false
  if (value !== 'true') console.warn(`  ${deck.file}: draft: ${deck.draft} を非公開として扱います`)
  return true
}

const decks = readdirSync(ROOT)
  .filter((f) => f.endsWith('.md') && !NOT_DECKS.has(f))
  .map((file) => {
    const slug = file.replace(/\.md$/, '')
    return { file, slug, isTemplate: file === TEMPLATE, ...readFrontmatter(file) }
  })

for (const deck of decks) deck.draftInMarkdown = isDraft(deck)

/*
 * 枚数は Slidev 自身のパーサに数えさせる。
 * --- は区切りにも各スライドの frontmatter にも使われるので、自分で数えると
 * 二重に数えてしまう（dbms が 35 枚なのに 69 と出ていた）。
 */
for (const deck of decks) {
  const parsed = await parse(readFileSync(join(ROOT, deck.file), 'utf8'), deck.file)
  deck.slideCount = parsed.slides.length
}

// DB（slides.decks）と突き合わせる。admin のトグルはここで効く
const resolved = await resolveVisibility(decks)

const published = resolved.filter((d) => d.visible)
const drafts = resolved.filter((d) => !d.visible)

// 新しい順。date が無いものは後ろにまとめる
published.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.slug.localeCompare(b.slug))

/*
 * 公開対象が 0 本でも止めない。
 *
 * 以前はここで exit していたが、全部を非公開・予約にした瞬間にビルドが中止され、
 * **古い dist がそのまま残って公開され続けていた**。
 * 0 本なら「空の一覧」を出すのが正しい。
 */
if (published.length === 0) console.warn('\n[decks] 公開対象のデッキがありません。一覧は空になります')

rmSync(DIST, { recursive: true, force: true })
mkdirSync(DIST, { recursive: true })

const buildDeck = (deck, outDir, base) => {
  console.log(`\n--- ${deck.file} -> dist/${outDir}/`)
  // --base はサブディレクトリ配信に必須。無いとアセットを / 直下に探して 404 になる
  execFileSync(SLIDEV, ['build', deck.file, '--out', join('dist', outDir), '--base', base], { stdio: 'inherit' })
}

/*
 * 同意のバナーと閲覧の集計を、デッキの HTML に差し込む。
 *
 * **ビルドのあとに入れる。** 中身は slidev が吐くので、こちらが持てるのは
 * 出来上がった index.html だけ。</body> の手前に置けば、スライドの描画や
 * キー操作には触らない。
 */
const injectConsent = (outDir, kind, target) => {
  const file = join(DIST, outDir, 'index.html')
  if (!existsSync(file)) return
  const html = readFileSync(file, 'utf8')
  if (html.includes('y4bu-consent')) return
  writeFileSync(file, html.replace('</body>', `${consentSnippet({ kind, target })}${insightsSnippet()}</body>`))
}

for (const deck of published) {
  buildDeck(deck, deck.slug, `/${deck.slug}/`)
  injectConsent(deck.slug, 'deck', deck.slug)
}

/*
 * 非公開のデッキは admin から捲れるように、推測できないトークンの下に出す。
 * 一覧には載せない。**URL を知っていれば見られる**ので、トークンは admin の
 * 画面にしか出さない。
 */
for (const deck of drafts) {
  if (!deck.previewToken) continue
  // 下書きには入れない。admin から確かめるだけのものを数えても意味が無い
  buildDeck(deck, join('_preview', deck.previewToken), `/_preview/${deck.previewToken}/`)
}

/*
 * 表紙。**公開しているデッキのぶんだけ配る。**
 *
 * 以前は thumbs/ を丸ごと写していたので、非公開のデッキの表紙まで
 * slides.y4bu.net/thumbs/<slug>.png で見られた。slug は .md のファイル名で、
 * このリポジトリは公開しているので、推測するまでもなく分かる。
 *
 * 下書きのぶんは、捲るのと同じトークンの下に置く。admin からは見られるが、
 * URL を知らない人には辿れない。
 */
const copyThumb = (slug, to) => {
  const from = join(ROOT, 'thumbs', `${slug}.png`)
  if (!existsSync(from)) return
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to)
}

for (const deck of published) copyThumb(deck.slug, join(DIST, 'thumbs', `${deck.slug}.png`))

for (const deck of drafts) {
  if (!deck.previewToken) continue
  copyThumb(deck.slug, join(DIST, '_preview', deck.previewToken, 'thumb.png'))
}

// 一覧ページ用。デッキ側の dist/<slug>/fonts とは別に、dist 直下にも要る
cpSync(join(ROOT, 'public', 'fonts'), join(DIST, 'fonts'), { recursive: true })
cpSync(join(ROOT, 'styles', 'fonts.css'), join(DIST, 'fonts.css'))

// マスコットとファビコン。一覧ページが参照する
cpSync(join(ROOT, 'public', 'mascot'), join(DIST, 'mascot'), { recursive: true })

// 一覧ページのフッターのロゴ。LinkedIn は simpleicons に無いので自前で持つ
cpSync(join(ROOT, 'public', 'logos'), join(DIST, 'logos'), { recursive: true })

// SNS に貼ったときの画像。scripts/make-og.mjs で焼いたものを配る
if (existsSync(join(ROOT, 'public', 'og'))) {
  cpSync(join(ROOT, 'public', 'og'), join(DIST, 'og'), { recursive: true })
}
for (const icon of ['favicon.ico', 'icon-192.png']) {
  if (existsSync(join(ROOT, 'public', icon))) cpSync(join(ROOT, 'public', icon), join(DIST, icon))
}

const page = renderIndex(
  published.map((deck) => ({ ...deck, hasThumb: existsSync(join(ROOT, 'thumbs', `${deck.slug}.png`)) })),
)
writeFileSync(join(DIST, 'index.html'), page)

console.log(`\n公開 ${published.length} 本 / 下書き ${drafts.length} 本`)
for (const d of published) console.log(`  公開   /${d.slug}/  ${d.title ?? ''}`)
for (const d of drafts) {
  const why = d.draftInMarkdown ? '.md が draft' : d.waiting ? '公開待ち（予約）' : 'admin で非公開'
  console.log(`  下書き ${d.file}（${why}）`)
}
