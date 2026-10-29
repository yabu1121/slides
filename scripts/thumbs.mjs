/*
 * 各デッキの 1 枚目を PNG にして thumbs/<slug>.png に置く。一覧ページのサムネイル。
 *
 * slidev export がヘッドレスブラウザを使うので playwright-chromium が必要。
 * 入っていなければ `npx playwright install chromium` を一度流す。
 *
 * 生成した PNG はコミットする。ビルド側（build-all.mjs）は thumbs/ をコピーする
 * だけなので、Vercel 上でブラウザを用意しなくて済む。
 *
 *   npm run thumbs                      全デッキ
 *   npm run thumbs -- portfolio-infrastructure.md   1 本だけ
 */

import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SLIDEV = join(ROOT, 'node_modules', '.bin', 'slidev')
const TMP = join(ROOT, '.thumbs-tmp')
const NOT_DECKS = new Set(['README.md', 'CLAUDE.md', 'AGENTS.md', 'MEMO.md', 'slides.md'])

const only = process.argv.slice(2)
const decks = (only.length ? only : readdirSync(ROOT).filter((f) => f.endsWith('.md') && !NOT_DECKS.has(f)))

mkdirSync(join(ROOT, 'thumbs'), { recursive: true })

for (const file of decks) {
  const slug = file.replace(/\.md$/, '')
  const out = join(TMP, slug)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })

  console.log(`--- ${file}`)
  execFileSync(SLIDEV, ['export', file, '--format', 'png', '--range', '1', '--output', out], { stdio: 'inherit' })

  // 出力名は slidev のバージョンで変わるので、できた PNG の先頭を使う
  const png = readdirSync(out, { recursive: true }).filter((f) => String(f).endsWith('.png')).sort()[0]
  if (!png) {
    console.error(`  PNG が作られませんでした: ${file}`)
    continue
  }
  copyFileSync(join(out, String(png)), join(ROOT, 'thumbs', `${slug}.png`))
  console.log(`  thumbs/${slug}.png`)
}

rmSync(TMP, { recursive: true, force: true })
