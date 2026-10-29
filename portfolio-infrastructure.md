---
theme: default
colorSchema: light
title: インフラ構成の変更
titleTemplate: '%s'
transition: fade
mdc: true
lineNumbers: false
# magic-move は「溶ける」のではなく「動く」ように寄せる
magicMoveDuration: 700
shiki:
  magicMove:
    stagger: 0          # 1 文字ずつずれて動くのをやめる
    delayMove: 0        # まず動く
    delayLeave: 0       # 消える分はすぐ消す
    delayEnter: 0.75    # 増える分は動き終わってから出す
    animateContainer: true   # 枠の高さも一緒に伸ばす。これがないと段差ができる
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
drawings:
  persist: false
hideInToc: true
fonts:
  sans: 'Inter, Hiragino Sans, Noto Sans JP'
  mono: 'Geist Mono, JetBrains Mono, SF Mono, Menlo'
  local: ['Inter', 'Hiragino Sans', 'Noto Sans JP', 'Geist Mono', 'JetBrains Mono', 'SF Mono', 'Menlo']
layout: cover
---

<!--
================================================================
 表紙
================================================================
 全面を絶対配置で組んでいる。置くものは 4 つだけ。

   枠      ... スライドの縁の内側に 1 本。消さない
   タイトル ... 左。上に寄せすぎず、縦の 1/3 あたりに置く
   イベント ... 右上。無いときは span ごと消す
   発表者   ... 左下。名前と日付

 ---- 枠 ------------------------------------------------------------
 スライドの地を薄い緑のグラデーションで塗り、内側 18px に白いパネルを載せている。
 外周の帯がそのまま枠になる。帯の幅は変えない。
 濃さを変えるなら styles/index.css の --c-cover-band を動かす。

 遊びの線は全面の <svg> にまとめてある。3 つだけ。
   ・左から入って渦を巻く線。帯をまたいで外から入ってくる
   ・右下と上の白い短い線。色帯の上に乗せて枠を切る
 増やさない。増やすと表紙が散らかる。

 ---- 題材のアイコン ------------------------------------------------
 タイトルの右、同じ高さに 1 つだけ置く。その回の題材をデフォルメしたもの。

   <div class="i-ph-stack-fill w-[74px] h-[74px]" style="color: var(--c-accent-ink)"></div>

 ・塗りつぶしのアイコンを選ぶ。線画だと枠の中で痩せて見える
   ph の -fill 付き（i-ph-rocket-launch-fill など）が使いやすい
 ・logos の色付きロゴを入れるときは style の color を外す
 ・枠の大きさと位置は動かさない。タイトルと高さを揃えてある
 ・2 つ以上置かない

 ---- 風景 ----------------------------------------------------------
 右下にデフォルメした風景。画面のおよそ 3 割。
 ビルはアクセントの空色（--c-accent / --c-accent-deep / --c-accent-soft）、
 地面とアンテナは ink。名刺と同じ色づかいに揃えてある。
 右上がりにして左へ溶かす。左端はマスクで消しているので縦の切れ目ができない。

 グラデーションは <defs> にまとめてある。4 つだけ。
   cvGlow   右上のぼんやりした光。中心から外へ消える
   cvBack   奥のビル。下へ行くほど薄くなる
   cvFront  手前のビル。上から下へ濃くなる
   cvGround 地面。上が少し明るい
 色はすべて var(--c-*) を stop-color に入れている。直接の色コードを書かない。

 紙飛行機は小さいまま。後ろから見た形にして、奥へ飛んでいくように見せる。
 軌跡はくねくねさせて、根元が消えるグラデーション（cvTrail）をかけてある。
 向きは軌跡の終わりと揃える。角度を変えたら rotate の値も合わせる。

 差し替えるなら画像を public/ に置いて

   <img src="/cover.png" class="w-[690px]">

 に入れ替える。
 サブタイトルは置かない。言いたいことはタイトル 1 行に収める。

 注意 2 つ。どちらも Vue のコンパイルが落ちる。
 ・HTML の開きタグは 1 行に収める。属性を改行でまたがない
 ・SVG の中に空行を入れない。空行で HTML ブロックが切れ、
   そのあとの深いインデントがコードブロック扱いになる
================================================================
-->

<div class="relative w-full h-full" style="background: linear-gradient(135deg, var(--c-accent-soft) 0%, var(--c-cover-band) 100%)">

  <div class="absolute inset-[18px] rounded-2xl overflow-hidden" style="background: var(--c-bg)">
    <div class="absolute inset-0 u-grid-paper" style="opacity: 0.9; -webkit-mask-image: linear-gradient(115deg, transparent 30%, #000 88%); mask-image: linear-gradient(115deg, transparent 30%, #000 88%)"></div>
  </div>

  <div class="absolute right-[18px] bottom-[18px] w-[690px] overflow-hidden" style="border-bottom-right-radius: 16px; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 30%); mask-image: linear-gradient(90deg, transparent 0%, #000 30%)">
    <svg viewBox="0 0 580 280" class="w-full block">
      <defs>
        <radialGradient id="cvGlow">
          <stop offset="0" stop-color="var(--c-accent-soft)" />
          <stop offset="1" stop-color="var(--c-accent-soft)" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="cvBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--c-accent-soft)" />
          <stop offset="1" stop-color="var(--c-accent-soft)" stop-opacity="0.3" />
        </linearGradient>
        <linearGradient id="cvFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--c-accent)" />
          <stop offset="1" stop-color="var(--c-accent-deep)" />
        </linearGradient>
        <linearGradient id="cvTrail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="var(--c-ink-3)" stop-opacity="0" />
          <stop offset="1" stop-color="var(--c-ink-3)" stop-opacity="1" />
        </linearGradient>
        <linearGradient id="cvGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--c-cover-band)" />
          <stop offset="1" stop-color="var(--c-accent)" />
        </linearGradient>
      </defs>
      <circle cx="486" cy="58" r="76" fill="url(#cvGlow)" />
      <path d="M104 234 C 140 220 130 190 164 178 C 198 166 188 142 216 132" stroke="url(#cvTrail)" stroke-width="2.5" stroke-dasharray="3 8" stroke-linecap="round" fill="none" />
      <g transform="translate(224 128) rotate(58)">
        <path d="M0 0 L-13 21 L0 14 L13 21 Z" fill="var(--c-ink-2)" />
        <path d="M0 0 L0 14" stroke="var(--c-bg)" stroke-width="1.2" fill="none" />
      </g>
      <rect x="296" y="176" width="44" height="80" rx="6" fill="url(#cvBack)" />
      <rect x="348" y="156" width="34" height="100" rx="6" fill="url(#cvBack)" />
      <rect x="390" y="140" width="50" height="116" rx="6" fill="url(#cvBack)" />
      <rect x="448" y="164" width="36" height="92" rx="6" fill="url(#cvBack)" />
      <rect x="492" y="132" width="46" height="124" rx="6" fill="url(#cvBack)" />
      <rect x="546" y="160" width="34" height="96" rx="6" fill="url(#cvBack)" />
      <path d="M365 156 V128" stroke="var(--c-ink)" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="365" cy="124" r="5" fill="var(--c-ink)" />
      <path d="M515 132 V102" stroke="var(--c-ink)" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="515" cy="98" r="5" fill="var(--c-ink)" />
      <path d="M365 128 C 412 160 470 150 515 104" stroke="var(--c-ink)" stroke-width="2" fill="none" stroke-linecap="round" />
      <rect x="318" y="200" width="48" height="60" rx="6" fill="url(#cvFront)" />
      <rect x="374" y="182" width="40" height="78" rx="6" fill="url(#cvFront)" />
      <rect x="422" y="192" width="56" height="68" rx="6" fill="url(#cvFront)" />
      <rect x="486" y="170" width="42" height="90" rx="6" fill="url(#cvFront)" />
      <rect x="536" y="186" width="38" height="74" rx="6" fill="url(#cvFront)" />
      <g fill="var(--c-bg)">
        <rect x="328" y="212" width="9" height="9" rx="2" />
        <rect x="345" y="212" width="9" height="9" rx="2" />
        <rect x="328" y="230" width="9" height="9" rx="2" />
        <rect x="384" y="196" width="9" height="9" rx="2" />
        <rect x="397" y="196" width="9" height="9" rx="2" />
        <rect x="384" y="214" width="9" height="9" rx="2" />
        <rect x="434" y="206" width="9" height="9" rx="2" />
        <rect x="451" y="206" width="9" height="9" rx="2" />
        <rect x="434" y="224" width="9" height="9" rx="2" />
        <rect x="496" y="184" width="9" height="9" rx="2" />
        <rect x="509" y="184" width="9" height="9" rx="2" />
        <rect x="496" y="202" width="9" height="9" rx="2" />
        <rect x="546" y="200" width="9" height="9" rx="2" />
        <rect x="559" y="200" width="9" height="9" rx="2" />
      </g>
      <rect x="451" y="224" width="9" height="9" rx="2" fill="var(--c-accent-soft)" />
      <rect x="509" y="202" width="9" height="9" rx="2" fill="var(--c-accent-soft)" />
      <rect x="402" y="230" width="4" height="13" rx="1.5" fill="var(--c-bg)" />
      <path d="M0 262 C 140 256 300 244 420 236 C 500 231 540 229 580 228 L580 280 L0 280 Z" fill="url(#cvGround)" />
    </svg>
  </div>

  <div class="absolute right-16 top-16 u-12 u-faint">イベント名</div>

  <div class="absolute left-16 top-[29%]">

# インフラ構成の変更

  </div>

  <div class="absolute right-[120px] top-[124px] w-[132px] h-[132px] flex items-center justify-center">
    <div class="i-ph-stack-fill w-[104px] h-[104px]" style="color: var(--c-accent-ink)"></div>
  </div>

  <div class="absolute left-16 bottom-16 flex items-baseline gap-6 u-12 u-faint">
    <span>なすはやと</span>
    <span>YYYY/MM/DD</span>
  </div>

</div>


---
hideInToc: true
---

<!--
================================================================
 何を作っているか
================================================================
 **最初にこれを言う。** 前は構成図からいきなり始めていて、
 何のサイトの話なのかが分からないまま図を見せていた。
 
 出どころは portfolio/README.md。
   ポートフォリオサイト。作品・スキル・経歴を掲載している
   データは管理画面から更新でき、コードを触らずに差し替えられる
================================================================
-->

# 何を作っているか

<div class="mt-10 grid gap-y-8" style="grid-template-columns: 88px minmax(0, 1fr); column-gap: 36px; max-width: 820px">
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 10px">サイト</div>
  <div class="u-20">y4bu.net。作品・スキル・経歴を載せたポートフォリオ</div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 10px">中身</div>
  <div class="u-20">管理画面から差し替えられる。コードを触らずに更新する</div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 10px">作り</div>
  <div class="u-20">Next.js で作って Vercel に置き、データは Supabase に入れている</div>
</div>

<div class="mt-10 u-16 u-muted">作品を 1 つ増やすたびにコードを直す、をやめたくて管理画面を付けた</div>

---
hideInToc: true
---

<!--
================================================================
 変更前の構成
================================================================
 1 つのサイトに全部入っていた形。ここを出発点にする。
 管理画面は同じサイトの /admin にあり、Basic 認証で守っていた。
================================================================
-->

# 変更前の構成

<Arch :cols="11.4" :rows="4.5">
  <ArchGroup type="plain" label="Vercel" :x="4.05" :y="1.05" :w="2.4" :h="1.45" />
  <ArchGroup type="region" label="Supabase" :x="7.7" :y="1.05" :w="3.4" :h="2.6" />

  <ArchNode id="repo" icon="github-icon" label="GitHub" sub="master" :x="5.25" :y="0.35" />
  <ArchNode id="user" icon="carbon:user-multiple" label="利用者" :x="0.55" :y="1.75" />
  <ArchNode id="cf" icon="cloudflare-icon" label="Cloudflare" sub="DNS / プロキシ" :x="2.3" :y="1.75" />
  <ArchNode id="web" icon="nextjs-icon" label="Next.js" sub="www.y4bu.net" :x="5.25" :y="1.75" />
  <ArchNode id="db" icon="postgresql" label="PostgreSQL" sub="Supabase" :x="9.4" :y="1.75" />
  <ArchNode id="storage" icon="supabase-icon" label="Storage" sub="skill_images" :x="9.4" :y="3.0" />
  <ArchNode id="mail" icon="google-gmail" label="Gmail SMTP" sub="nodemailer" :x="5.25" :y="3.95" />

  <ArchLink from="user" to="cf" label="www.y4bu.net" />
  <ArchLink from="cf" to="web" />
  <ArchLink from="repo" to="web" label="自動デプロイ" />
  <ArchLink from="web" to="db" />
  <ArchLink from="web" to="storage" bend="v" />
  <ArchLink from="web" to="mail" label="問い合わせ" />
</Arch>

<div class="mt-3 u-16 u-muted">サイトは 1 つ。管理画面も同じサイトの中にあった</div>

---
hideInToc: true
---

<!--
================================================================
 課題 1 — 直しても表に出ない
================================================================
 2026-10-28 に実測。age 2,167,101 秒（25.1 日）、x-vercel-cache: HIT。
 x-nextjs-stale-time は 300 秒なのに作り直されていなかった。
 
 **専門用語をスライドに出さない。** 言いたいのは「直したのに表に出ない」
 の一点なので、そこだけ書く。
================================================================
-->

# 課題 1 — 直しても、表に出ない

<div class="mt-8 grid gap-y-7" style="grid-template-columns: 76px minmax(0, 1fr); column-gap: 36px; max-width: 860px">
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 11px">症状</div>
  <div>
    <div class="u-20">管理画面で直したのに、公開ページは 25 日前のまま</div>
    <div class="u-16 u-muted mt-2">何度開いても、前にデプロイしたときのページがそのまま返ってくる</div>
  </div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 11px">原因</div>
  <div>
    <div class="u-20">できあがったページを配っていた</div>
    <div class="u-16 u-muted mt-2">速くするために完成品を先に作っておく仕組みで、作り直すきっかけが無かった</div>
  </div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 11px">影響</div>
  <div>
    <div class="u-20">管理画面が、ただの入力フォームになっていた</div>
    <div class="u-16 u-muted mt-2">書き込めるのに表に出ないので、結局コードを直してデプロイしていた</div>
  </div>
</div>

<div class="mt-7 u-12 u-faint">2026-10-28 に実測。何度叩いてもキャッシュに当たり続け、最終更新からの経過が 2,167,101 秒だった</div>

---
hideInToc: true
---

<!--
================================================================
 課題 2 — 管理画面が重い
================================================================
 関数は Vercel の既定リージョン iad1（バージニア）、
 DB は Supabase の ap-southeast-1（シンガポール）。
 1 クエリの往復が約 230ms、admin の 1 画面で十数本投げていた。
 
 **原因はクエリ数ではなく距離。** 本数を減らす前に置き場所が違っていた。

 ---- 吹き出し ------------------------------------------------------
 症状の行の横に u-balloon を 1 つ置いてクリックで出す。
 「数秒かかる」を見た聞き手が思う問いを先に出して、
 すぐ下の原因の行で答える、という順にする。

 **原因の行には付けない。** すぐ下に答えが書いてあるので、
 同じことを 2 回言うことになる。

 MEMO: 「どちらも作ったときのまま触っていなかった」は推測混じり。
        Vercel の既定が iad1 なのは事実だが、Supabase を
        ap-southeast-1 にした理由は聞いていない。実際の経緯に差し替える。
================================================================
-->

# 課題 2 — 管理画面が重い

<div class="relative">

<div class="absolute u-balloon left-[640px] top-[6px] z-10" v-click>
  <div class="u-20 font-bold">なんで？</div>
</div>

<div class="mt-8 grid gap-y-7" style="grid-template-columns: 76px minmax(0, 1fr); column-gap: 36px; max-width: 860px">
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 11px">症状</div>
  <div>
    <div class="u-20">1 画面を開くのに数秒かかる</div>
    <div class="u-16 u-muted mt-2">作品を 1 つ直すだけでも、そのたびに待たされる</div>
  </div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 11px">原因</div>
  <div>
    <div class="u-20">サーバーはアメリカ、データベースはシンガポール</div>
    <div class="u-16 u-muted mt-2">1 往復に 230ms かかり、1 画面でそれを十数回くり返していた</div>
  </div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 11px">影響</div>
  <div>
    <div class="u-20">問い合わせの回数を減らしても縮まらない</div>
    <div class="u-16 u-muted mt-2">効いていたのは回数ではなく距離だったので、置き場所を直すしかなかった</div>
  </div>
</div>

</div>

<div class="mt-7 u-12 u-faint">Supabase はあとからリージョンを変えられないため、新しいプロジェクトを作って移した</div>

---
layout: section
hideInToc: true
---

<!--
================================================================
 言い切りの 1 枚
================================================================
 課題を 2 つ出したあと、個別に直す話へ行かずにここで方針を決める。
 **ここに手段を書かない。** どう変えたかは次のページから。
================================================================
-->

# どうせならもう構成から<br>色々アップデートしよう！

---
hideInToc: true
---

<!--
================================================================
 新しい構成
================================================================
 2026-10-29 の実測。www / blog / slides / admin の 4 ドメイン。
 Cloudflare のプロキシは apex と admin だけ ON、公開 3 サイトは Vercel 直。
================================================================
-->

# 新しい構成

<Arch :cols="13.6" :rows="5.1">
  <ArchGroup type="plain" label="Vercel" :x="4.5" :y="0.1" :w="3.0" :h="4.55" />
  <ArchGroup type="region" label="Supabase" :x="9.6" :y="2.4" :w="3.5" :h="1.4" />

  <ArchNode id="user" icon="carbon:user-multiple" label="利用者" :x="0.55" :y="1.75" :size="0.54" />
  <ArchNode id="owner" icon="carbon:user-admin" label="管理者" :x="0.55" :y="4.25" :size="0.54" />
  <ArchNode id="cf" icon="cloudflare-icon" label="Cloudflare" sub="Access" :x="2.6" :y="4.25" :size="0.54" />
  <ArchNode id="deck" icon="slidev" label="スライド" sub="slides・静的" :x="6.0" :y="0.55" :size="0.54" />
  <ArchNode id="www" icon="nextjs-icon" label="ポートフォリオ" sub="www" :x="6.0" :y="1.75" :size="0.54" />
  <ArchNode id="blog" icon="nextjs-icon" label="ブログ" sub="blog" :x="6.0" :y="3.05" :size="0.54" />
  <ArchNode id="admin" icon="nextjs-icon" label="管理画面" sub="admin" :x="6.0" :y="4.25" :size="0.54" />
  <ArchNode id="mail" icon="google-gmail" label="Gmail SMTP" sub="nodemailer" :x="8.4" :y="0.35" :size="0.54" />
  <ArchNode id="db" icon="postgresql" label="PostgreSQL" sub="public / blog" :x="11.0" :y="3.05" :size="0.54" />
  <ArchNode id="storage" icon="supabase-icon" label="Storage" sub="画像" :x="12.5" :y="3.05" :size="0.54" />

  <ArchLink from="user" to="deck" bend="v" />
  <ArchLink from="user" to="www" />
  <ArchLink from="user" to="blog" bend="v" />
  <ArchLink from="owner" to="cf" />
  <ArchLink from="cf" to="admin" label="Access" />
  <ArchLink from="www" to="mail" bend="h" label="問い合わせ" labelOn="last" />
  <ArchLink from="www" to="db" bend="h" />
  <ArchLink from="blog" to="db" />
  <ArchLink from="admin" to="db" bend="h" />
  <ArchLink from="admin" to="storage" bend="h" />
</Arch>

<div class="mt-3 u-20">4 つのドメインに分けて、表示するものは管理画面から決める</div>
<div class="mt-2 u-12 u-muted">管理画面が書いたあと、公開サイトに「作り直して」と伝える口を叩いてキャッシュを落とす</div>

---
hideInToc: true
---

<!--
================================================================
 なぜこの形にしたのか
================================================================
 比較の型。観点ごとに横に並べる。**左右に箇条書きを 2 つ置かない。**
 
 blog/README.md に判断が書いてある。
   管理画面を同じホストの /admin に置かないのは、書き込み用のパスが
   保護の外に残りやすいため。ホストごと分ければその隙が生まれない。
 
 Cloudflare を admin だけに置く理由（2026-10-29 の実測）
   ・オリジンは Vercel の共有エッジなので、IP を隠しても守る対象が無い
   ・挟むと TLS の区間が 2 本になり、Cloudflare が中身を平文で見る
   ・HTML はそもそもキャッシュされていなかった（cf-cache-status: DYNAMIC）
   → 残す理由は Access だけ
================================================================
-->

# なぜこの形にしたのか

<div class="mt-10 grid gap-y-7" style="grid-template-columns: 120px max-content max-content; justify-content: start; column-gap: 48px">
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 6px">置き場所</div>
  <div class="u-20 u-muted">1 つのサイトに全部</div>
  <div class="u-20">用途ごとにドメインを分ける</div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 6px">管理画面</div>
  <div class="u-20 u-muted">同じサイトの /admin</div>
  <div class="u-20">別のドメイン</div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 6px">入口の鍵</div>
  <div class="u-20 u-muted">アプリの中で認証</div>
  <div class="u-20">手前の Cloudflare で止める</div>
</div>

<div class="mt-10 u-16 u-muted">書き込める入口を、公開サイトと同じ場所に置かない。分けておけば守り忘れが起きない</div>

---
hideInToc: true
---

<!--
================================================================
 効いたこと
================================================================
 **数字は 2 つまで。** 変化率を省かない。
 
 **2758ms → 14ms は DB 往復の中央値で、ページの表示時間ではない。**
 「ページが 2.7 秒から 14ms になった」と言うと嘘になる。下の一行で明示する。
 移行前の計測ログは残っていないので、出し直すなら再計測が要る。
 
 移行の規模: DB 13MB / Storage 46 ファイル / URL の書き換え 35 箇所 /
 Vercel の環境変数 8 ターゲット。ダウンタイムの秒数は測っていない。
================================================================
-->

# 効いたこと

<div class="mt-10 flex gap-24">
  <div>
    <div class="u-12 u-muted">データベースとの往復</div>
    <div class="mt-2 flex items-baseline gap-4">
      <span class="u-36">2758ms</span>
      <span class="u-20 u-faint">→</span>
      <span class="u-36">14ms</span>
    </div>
    <div class="mt-2 u-16" style="color: var(--c-accent-ink); font-weight: 700">−99.5%</div>
  </div>
  <div>
    <div class="u-12 u-muted">直してから表に出るまで</div>
    <div class="mt-2 flex items-baseline gap-4">
      <span class="u-36">25.1 日</span>
      <span class="u-20 u-faint">→</span>
      <span class="u-36">0 秒</span>
    </div>
    <div class="mt-2 u-16" style="color: var(--c-accent-ink); font-weight: 700">その場で出る</div>
  </div>
</div>

<div class="mt-9 u-16 u-muted">データベースを東京へ移し、サーバーも東京に寄せた。移したのは 13MB と 46 ファイル、URL の書き換えが 35 箇所</div>

<div class="mt-6 u-12 u-faint">2758ms → 14ms はデータベースとの往復の中央値で、ページの表示時間ではない。移行前のログは残っていないので、出し直すなら再計測が要る</div>

---
hideInToc: true
---

<!--
================================================================
 まとめ
================================================================
 3 行。ラベルは 結論 / 効いたこと / つぎ で固定。
 **本編で言っていないことを書かない。**
 
 ---- つぎ ----------------------------------------------------------
   スライドに出すのは旧環境の片付けだけ。

   **未対応の弱点をここに書かない。** このデッキは slides.y4bu.net で
   公開されていて、**HTML コメントもビルド結果に入って外から読める。**
   直っていない穴を書くのは、弱点を自分で公表するのと同じになる。
   残タスクの一覧は手元のメモか admin 側で持つ。
 
 ---- 聞かれたら出す（落とし穴）------------------------------------
   ・新形式のキー（sb_secret_…）は JWT ではないので Storage が弾く。
     画像のアップロードだけ 400 Invalid Compact JWS になる
   ・Supabase はリージョンを変更できない。新規プロジェクトを作って移す
   ・Vercel の設定キーは serverlessFunctionRegion
   ・既存の環境変数は vercel env add --force でないと上書きできない
   ・git 連携済みへの vercel deploy --prod は古い内容が出ることがある
================================================================
-->

# まとめ

<div class="mt-14 grid gap-y-9" style="grid-template-columns: 88px minmax(0, 1fr); column-gap: 36px; max-width: 820px">
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 10px">結論</div>
  <div class="u-20">用途ごとにドメインを分けて、表示するものは管理画面から決める形にした</div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 10px">効いたこと</div>
  <div class="u-20 u-muted">データベースを東京へ寄せて往復が 2758ms から 14ms、更新はその場で出るようになった</div>
  <div class="u-12 text-right" style="color: var(--c-accent-ink); letter-spacing: 0.14em; padding-top: 10px">つぎ</div>
  <div class="u-20 u-muted">シンガポールに残っている古い環境を片付ける</div>
</div>
