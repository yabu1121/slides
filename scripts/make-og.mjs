/*
 * slides の OGP 画像を 1 枚焼く。
 *
 * **ここは静的なサイトなので、その場で作る口を持てない。** www と blog は
 * Next が描いてくれるが、こちらはビルドのときに png を 1 枚作って置く。
 * 見た目は 3 サイトで同じ（鳥・タイトル・hayato・y4bu.net）。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
// playwright は slides の依存ではないので、入っている場所を指して読む
const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')

const ROOT = process.cwd()
const bird = readFileSync(join(ROOT, 'public/og/flying.png')).toString('base64')

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family: Murecho; src: url('file://${join(ROOT, 'public/fonts/og-murecho-700.ttf')}'); font-weight: 700 }
  body { margin:0; width:1200px; height:630px; display:flex; align-items:center; justify-content:center; gap:56px; padding:0 88px; box-sizing:border-box;
         background:#fff;
         background-image:
           linear-gradient(#e8f3f9 1px, transparent 1px), linear-gradient(90deg, #e8f3f9 1px, transparent 1px),
           linear-gradient(#f3f9fc 1px, transparent 1px), linear-gradient(90deg, #f3f9fc 1px, transparent 1px);
         background-size: 140px 140px, 140px 140px, 28px 28px, 28px 28px;
         font-family: Murecho, sans-serif; }
  .t { font-size:72px; font-weight:700; color:#16191d; line-height:1.25 }
  .who { margin-top:28px; display:flex; align-items:baseline; gap:18px }
  .who b { font-size:34px; color:#4b5563 }
  .who span { font-size:26px; color:#8b949e }
</style>
<img src="data:image/png;base64,${bird}" width="300" height="300">
<div><div class="t">スライド</div>
<div class="who"><b>hayato</b><span>y4bu.net</span></div></div>`

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
await p.setContent(html)
await p.waitForTimeout(500)
const png = await p.screenshot()
writeFileSync(join(ROOT, 'public/og/og.png'), png)
await b.close()
console.log('  public/og/og.png を焼いた')
