/*
 * slides.y4bu.net になるサイトそのものを手元で動かす。
 *
 * slidev の dev サーバは 1 デッキしか開けないので、一覧ページ（dist/index.html）
 * と各デッキを並べた本番の形は見られない。ここでは
 *
 *   1. 一度ビルドして dist を作る
 *   2. dist を静的配信する（vercel.json と同じ SPA フォールバック付き）
 *   3. デッキや共通資産を触ったら作り直す
 *
 * をやる。依存は足していない（node の http と fs だけ）。
 *
 *   npm run dev:site            3030 で起動
 *   PORT=4000 npm run dev:site  ポートを変える
 *
 * デッキ 1 枚を書いている最中は、こちらではなく slidev の dev が向いている。
 *   npm run dev -- portfolio-infrastructure.md
 *
 * POST /__rebuild で作り直す。本番の Vercel Deploy Hook と同じ入口なので、
 * admin の SLIDES_DEPLOY_HOOK_URL をここに向けると、公開トグルの挙動を
 * 手元で通しで確認できる。
 *
 *   SLIDES_DEPLOY_HOOK_URL=http://localhost:3030/__rebuild
 *
 * この口はこの開発用スクリプトにしか無い（本番は静的配信なので存在しない）。
 * 念のため loopback 以外からは受け付けない。
 */

import { spawn } from 'node:child_process'
import { createReadStream, existsSync, statSync, watch } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const PORT = Number(process.env.PORT ?? 3030)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
}

let building = false
let queued = false

const build = () => {
  if (building) {
    queued = true
    return
  }
  building = true

  console.log('\n[site] ビルド中...')
  const child = spawn('node', ['scripts/build-all.mjs'], { cwd: ROOT, stdio: 'inherit' })

  child.on('exit', (code) => {
    building = false
    console.log(code === 0 ? `[site] http://localhost:${PORT}` : `[site] ビルド失敗 (${code})`)
    if (queued) {
      queued = false
      build()
    }
  })
}

/* ---- 監視。デッキと共通資産を見る -------------------------------------- */

let timer
const rebuildSoon = (file) => {
  if (file && /^dist|node_modules|\.thumbs-tmp/.test(file)) return
  clearTimeout(timer)
  // 保存のたびに走らせない。エディタは 1 回の保存で複数イベントを出す
  timer = setTimeout(build, 400)
}

for (const dir of ['.', 'components', 'styles', 'setup', 'public', 'thumbs']) {
  const target = join(ROOT, dir)
  if (!existsSync(target)) continue
  watch(target, { recursive: dir !== '.' }, (_event, file) => {
    // ルートは .md だけ見る（dist や node_modules の変更で回さない）
    if (dir === '.' && !String(file).endsWith('.md')) return
    rebuildSoon(String(file))
  })
}

/* ---- 静的配信 ----------------------------------------------------------- */

const send = (res, path, status = 200) => {
  res.writeHead(status, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
  createReadStream(path).pipe(res)
}

/** 127.0.0.1 / ::1 からか。LAN の別端末に再ビルドを起こさせない */
const fromLoopback = (req) => {
  const address = req.socket.remoteAddress ?? ''
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0])

  // 本番の Deploy Hook と同じ役割。admin のトグルがここを叩く
  if (url === '/__rebuild') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
      return res.end('POST only')
    }
    if (!fromLoopback(req)) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
      return res.end('Forbidden')
    }

    console.log('[site] 再ビルドの要求を受けました（admin のトグル）')
    build()

    res.writeHead(202, { 'content-type': 'application/json; charset=utf-8' })
    return res.end(JSON.stringify({ building: true }))
  }
  // 上位ディレクトリへ抜ける細工を落とす
  const path = join(DIST, normalize(url).replace(/^(\.\.(\/|\\|$))+/, ''))

  if (existsSync(path) && statSync(path).isFile()) return send(res, path)

  const indexOfDir = join(path, 'index.html')
  if (existsSync(indexOfDir)) return send(res, indexOfDir)

  /*
   * SPA フォールバック。vercel.json の rewrites と同じ役割。
   * /deck-name/3 のようなスライド番号付きの URL をデッキの index.html に回す。
   * これが無いと 3 枚目でリロードすると 404 になる。
   *
   * 非公開デッキは /_preview/<token>/ の 2 階層なので、1 階層目と 2 階層目を順に見る。
   */
  const segments = url.split('/').filter(Boolean)
  for (const depth of [1, 2]) {
    if (segments.length < depth) break
    const candidate = join(DIST, ...segments.slice(0, depth), 'index.html')
    if (existsSync(candidate)) return send(res, candidate)
  }

  /*
   * ビルド中は dist を作り直しているので、まだファイルが無い。
   * 404 を返すと「消えた」と見えるので、少し待って読み直す画面を返す。
   */
  if (building) {
    res.writeHead(503, { 'content-type': 'text/html; charset=utf-8', 'retry-after': '3' })
    return res.end(
      '<meta http-equiv="refresh" content="2">' +
        '<body style="font:13px ui-monospace,monospace;padding:40px;color:#8b949e">building...</body>',
    )
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
  res.end('Not found')
}).listen(PORT, () => {
  console.log(`[site] 配信: http://localhost:${PORT}`)
  build()
})
