/*
 * 同意のバナーと、閲覧を数える一片。
 *
 * **slides は静的なので、ここだけ素の HTML と JS で書く。** www / blog は
 * React の部品があるが、デッキは slidev が吐いた HTML なので、ビルドの
 * あとに差し込む形にしている（build-all.mjs が </body> の手前に入れる）。
 *
 * 窓口は www に 1 本。cookie は親ドメイン（.y4bu.net）に置いてあるので、
 * どのサイトで答えても 3 サイトに効く。
 */

const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? 'https://www.y4bu.net'
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN ?? ''

/**
 * @param {{ kind: 'deck' | 'page', target: string }} what 数える対象
 */
export const consentSnippet = ({ kind, target }) => `
<style>
  #y4bu-consent {
    position: fixed; inset-inline: 0; bottom: 0; z-index: 2147483000;
    display: none; padding: 16px 20px;
    border-top: 1px solid #e5e7eb; background: rgba(255,255,255,.96);
    backdrop-filter: blur(8px);
    font-family: ui-sans-serif, -apple-system, "Hiragino Sans", sans-serif; color: #374151;
  }
  #y4bu-consent.is-on { display: block; }
  #y4bu-consent .inner { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; max-width: 768px; margin: 0 auto; }
  #y4bu-consent p { flex: 1 1 320px; margin: 0; font-size: 13px; line-height: 1.8; }
  #y4bu-consent a { color: #6b7280; font-size: 11px; }
  #y4bu-consent .acts { display: flex; gap: 8px; margin-left: auto; }
  #y4bu-consent button { padding: 8px 16px; border: 1px solid #e5e7eb; background: #fff; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: .04em; color: #6b7280; cursor: pointer; }
  #y4bu-consent button.ok { border-color: #38bdf8; background: #e0f2fe; color: #0369a1; }
</style>

<div id="y4bu-consent" role="dialog" aria-label="Cookie の利用について">
  <div class="inner">
    <p>当サイト（www / blog / slides）では、閲覧数と「よかった」の集計のために Cookie を使用します。取得した情報は本サイトの改善のみに利用し、広告配信や第三者への提供は行いません。<a href="${PORTFOLIO_URL}/privacy">詳細</a></p>
    <div class="acts">
      <button type="button" data-answer="no">同意しない</button>
      <button type="button" class="ok" data-answer="yes">同意する</button>
    </div>
  </div>
</div>

<script>
(function () {
  var NAME = 'y4bu_consent'
  var DOMAIN = ${JSON.stringify(COOKIE_DOMAIN)}
  var box = document.getElementById('y4bu-consent')

  var read = function () {
    var hit = document.cookie.split('; ').find(function (p) { return p.indexOf(NAME + '=') === 0 })
    return hit ? hit.slice(NAME.length + 1) : null
  }

  var count = function () {
    if (read() !== 'yes') return
    // 数えるのは読み込んだあと。描画も表示も止めない
    fetch(${JSON.stringify(`${PORTFOLIO_URL}/api/reactions?kind=${kind}&target=`)} + encodeURIComponent(${JSON.stringify(target)}), {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'view' })
    }).catch(function () {})
  }

  var answer = function (value) {
    var secure = location.protocol === 'https:' ? '; Secure' : ''
    var domain = DOMAIN ? '; Domain=' + DOMAIN : ''
    document.cookie = NAME + '=' + value + '; Max-Age=' + 60 * 60 * 24 * 180 + '; Path=/; SameSite=Lax' + domain + secure
    box.classList.remove('is-on')
    count()
  }

  if (read() === null) box.classList.add('is-on')
  else count()

  Array.prototype.forEach.call(box.querySelectorAll('[data-answer]'), function (b) {
    b.addEventListener('click', function () { answer(b.getAttribute('data-answer')) })
  })
})()
</script>
`

/*
 * Vercel の計測。**www / blog の Insights.tsx と同じ扱いにそろえる。**
 *
 * 速さ（Speed Insights）は経路と数値だけなので常に出す。
 * 閲覧（Web Analytics）は訪問者を数える話なので、同意が「はい」のときだけ
 * 読み込む。cookie は親ドメインに 1 つなので、www で答えていればここでも効く。
 *
 * **自分で script を足す形にする。** 静的なので React の部品が使えず、
 * Vercel が配る /_vercel/... をそのまま読むのがいちばん短い。
 */
export const insightsSnippet = () => `
<script defer src="/_vercel/speed-insights/script.js"></script>
<script>
(function () {
  var ok = document.cookie.split('; ').indexOf('y4bu_consent=yes') !== -1
  if (!ok) return
  var s = document.createElement('script')
  s.defer = true
  s.src = '/_vercel/insights/script.js'
  document.head.appendChild(s)
})()
</script>
`
