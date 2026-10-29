/*
 * グラフの見た目。色も字も styles/index.css の CSS 変数から取る。
 * ここに色のリテラルを書かない。トークンを変えればグラフも一緒に変わる。
 *
 * 方針は 3 つ。
 *   1. 墨と空色の 2 色だけ。系列が増えるときは濃さで分ける
 *   2. 枠線・影・立体・グラデーションを使わない
 *   3. 目盛りは横線だけ。地が方眼紙なので、これ以上線を増やさない
 */

/** :root から CSS 変数を 1 つ読む。SSR 中は空文字 */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined')
    return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

export function palette() {
  return {
    // 分析セクションの配色。グラフはこちらを使う
    green: token('--c-a-green', '#00ff7f'),
    sage: token('--c-a-sage', '#8fbc8f'),
    lavender: token('--c-a-lavender', '#e6e6fa'),
    slate: token('--c-a-slate', '#2f4f4f'),
    violet: token('--c-a-violet', '#8a2be2'),
    gray: token('--c-a-gray', '#696969'),
    ghost: token('--c-a-ghost', '#f8f8ff'),

    ink: token('--c-ink', '#16191d'),
    ink2: token('--c-ink-2', '#4b5563'),
    ink3: token('--c-ink-3', '#8b949e'),
    border: token('--c-border', '#e4e7eb'),
    borderStrong: token('--c-border-strong', '#cfd4da'),
    accent: token('--c-accent', '#5bc5e8'),
    accentInk: token('--c-accent-ink', '#1b7ea3'),
    accentDeep: token('--c-accent-deep', '#2aa4cd'),
    accentSoft: token('--c-accent-soft', '#e6f6fc'),
    bg: token('--c-bg', '#ffffff'),
    font: token('--font-sans', 'sans-serif'),
  }
}

/**
 * 系列の色。濃い順に並べる。
 *   1 本目 sage（くすんだ緑）/ 2 本目 slate（濃い青緑）
 *   3 本目 lavender / 4 本目 gray / 5 本目 violet
 * **green（#00ff7f）は既定に入れない。** 面積の大きい塗りに使うと蛍光色に見える。
 * 一番言いたい 1 つだけに名前で指定して使う。差し色として効く。
 * **4 本を超えたら系列を減らす。** 色で区別できる本数を超えている。
 */
export function series() {
  const c = palette()
  return [c.sage, c.slate, c.lavender, c.gray, c.violet]
}

/**
 * すべてのグラフに共通の土台。
 *
 * ---- 動き ----------------------------------------------------------
 * 少しずつ組み上がるが、送りの邪魔にならない速さにしてある。
 * animationDelay が要素ごとに 18ms ずつずらすので、棒や点が順に出てくる。
 * 1 枚が出そろうまで 0.6 秒ほど。**これ以上長くしない。**
 * 発表中はページを送り続けるので、待たされると話のテンポが崩れる。
 */
export function base() {
  const c = palette()
  const label = { color: c.gray, fontFamily: c.font, fontSize: 12 }

  return {
    color: series(),
    backgroundColor: 'transparent',
    animationDuration: 420,
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => 40 + idx * 18,
    animationDurationUpdate: 300,
    animationEasingUpdate: 'cubicInOut',
    textStyle: { fontFamily: c.font, color: c.slate },
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    legend: {
      show: false,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 20,
      icon: 'roundRect',
      textStyle: { ...label, color: c.gray },
    },
    xAxis: {
      axisLine: { lineStyle: { color: c.lavender } },
      axisTick: { show: false },
      axisLabel: { ...label, margin: 12 },
      splitLine: { show: false },
    },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...label, margin: 12 },
      splitLine: { lineStyle: { color: c.lavender } },
    },
  }
}

/** option を base に重ねる。配列は置き換え、オブジェクトは混ぜる */
export function merge<T>(a: any, b: any): T {
  if (Array.isArray(b) || b === null || typeof b !== 'object')
    return b as T
  const out: any = { ...a }
  for (const k of Object.keys(b)) {
    const av = a?.[k]
    const bv = b[k]
    out[k] = av && typeof av === 'object' && !Array.isArray(av) ? merge(av, bv) : merge(undefined, bv)
  }
  return out as T
}

/**
 * option の中の色名を実際の色に置き換える。
 * スライドには 'ink' 'accent' のような名前だけを書き、# 始まりの色を書かない。
 * 使える名前は palette() のキー。分析セクションで使うのは上の 7 つ。
 *   slate / green / sage / gray / violet / lavender / ghost
 *   ink / ink2 / ink3 / border / borderStrong
 *   accent / accentInk / accentDeep / accentSoft / bg
 */
export function resolveColors(node: any): any {
  const c: any = palette()
  // ゲージの axisLine のように [[0.7, 'green'], [1, 'lavender']] と
  // 入れ子になることがあるので、配列は中まで降りる
  const pick = (v: any): any => {
    if (Array.isArray(v))
      return v.map(pick)
    return typeof v === 'string' && c[v] ? c[v] : v
  }

  if (Array.isArray(node))
    return node.map(resolveColors)
  if (!node || typeof node !== 'object')
    return node

  const out: any = {}
  for (const k of Object.keys(node)) {
    const v = node[k]
    if (/color$/i.test(k))
      out[k] = pick(v)
    else
      out[k] = resolveColors(v)
  }
  return out
}

/**
 * xAxis / yAxis は配列で渡されることも、中身が複数あることもある。
 * base の軸設定を 1 本ずつに配り直す。
 */
export function withBase(option: any) {
  const b: any = base()
  const src = resolveColors(option)
  const out: any = merge(b, src)
  for (const axis of ['xAxis', 'yAxis']) {
    // 呼び出し側が軸を書いていないとき（円グラフなど）は軸ごと消す。
    // 残すと空の目盛り線が 1 本出る。
    if (src?.[axis] === undefined)
      delete out[axis]
    else if (Array.isArray(src[axis]))
      out[axis] = src[axis].map((a: any) => merge(b[axis], a))
  }
  if (src?.xAxis === undefined && src?.yAxis === undefined)
    delete out.grid
  return out
}
