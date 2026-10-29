<!--
  ノード同士をつなぐ線。

  **水平か垂直の線分しか引かない。** 斜めの線は構造上描けない。
  2点が同じ行か同じ列なら直線、そうでなければ必ず直角1回で折れる。

    <ArchLink from="alb" to="ecs" />                 直線（同じ行 / 同じ列）
    <ArchLink from="ecs" to="s3" bend="v" />         先に縦、あとで横
    <ArchLink from="ecs" to="s3" bend="h" />         先に横、あとで縦
    <ArchLink from="a" to="b" dashed label="非同期" />
    <ArchLink from="a" to="b" label="問い合わせ" labelOn="last" />  折れたあとに置く

  折れ線が他の線と重なるときは bend を手で指定して逃がす。
  それでも無理なら、ノードの座標をずらして同じ行か同じ列に揃える。
-->
<script setup lang="ts">
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  /** 始点の ArchNode の id */
  from: string
  /** 終点の ArchNode の id */
  to: string
  /** 曲がり方。auto は距離の長い方向へ先に進む */
  bend?: 'auto' | 'h' | 'v'
  /** 破線にする */
  dashed?: boolean
  /** 矢印の向き */
  arrow?: 'end' | 'both' | 'none'
  /** 線の上に出す短い文字 */
  label?: string
  /**
   * ラベルを置く線分。
   *   longest ... 一番長い線分の真ん中（既定）
   *   last    ... 折れたあとの線分。幹を共有して途中で分かれる線はこちら
   *   first   ... 折れる前の線分
   */
  labelOn?: 'longest' | 'first' | 'last' 
  /** ノードと線端の隙間（グリッド単位） */
  gap?: number
}>(), { bend: 'auto', dashed: false, arrow: 'end', gap: 0.06, labelOn: 'longest' })

const arch = inject<any>('arch')

let seq = 0
const uid = `archlink-${Math.random().toString(36).slice(2, 8)}-${seq++}`

const EPS = 0.02
const STROKE = '#5b6672'
const WIDTH = 0.026

const geometry = computed(() => {
  const a = arch.boxes.get(props.from)
  const b = arch.boxes.get(props.to)
  if (!a || !b)
    return null

  const g = props.gap
  const dx = b.x - a.x
  const dy = b.y - a.y
  const sx = Math.sign(dx) || 1
  const sy = Math.sign(dy) || 1

  // 中心から各辺までの距離。ラベルの張り出しも含む
  const aH = (sx > 0 ? a.right : a.left) + g
  const bH = (sx > 0 ? b.left : b.right) + g
  const aV = (sy > 0 ? a.bottom : a.top) + g
  const bV = (sy > 0 ? b.top : b.bottom) + g

  // 同じ行 -> 水平の直線
  if (Math.abs(dy) < EPS)
    return [{ x: a.x + sx * aH, y: a.y }, { x: b.x - sx * bH, y: b.y }]

  // 同じ列 -> 垂直の直線
  if (Math.abs(dx) < EPS)
    return [{ x: a.x, y: a.y + sy * aV }, { x: b.x, y: b.y - sy * bV }]

  // それ以外 -> 直角1回で折る。斜めにはしない
  const mode = props.bend === 'auto'
    ? (Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v')
    : props.bend

  if (mode === 'h') {
    return [
      { x: a.x + sx * aH, y: a.y },
      { x: b.x, y: a.y },
      { x: b.x, y: b.y - sy * bV },
    ]
  }
  return [
    { x: a.x, y: a.y + sy * aV },
    { x: a.x, y: b.y },
    { x: b.x - sx * bH, y: b.y },
  ]
})

const d = computed(() => {
  const pts = geometry.value
  if (!pts)
    return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
})

/**
 * ラベルを置く線分を選ぶ。既定は一番長い線分の真ん中。
 * 幹を共有して途中で分かれる線は、分かれたあとに乗せたいので labelOn で指定する。
 * 縦の線分に乗せるときは、線の上に字が重なるので右へ逃がして左揃えにする。
 */
const labelPos = computed(() => {
  const pts = geometry.value
  if (!pts)
    return null

  const at = (i: number) => {
    const p = pts[i]
    const q = pts[i + 1]
    return {
      x: (p.x + q.x) / 2,
      y: (p.y + q.y) / 2,
      vertical: Math.abs(q.x - p.x) < Math.abs(q.y - p.y),
    }
  }

  if (props.labelOn === 'first')
    return at(0)
  if (props.labelOn === 'last')
    return at(pts.length - 2)

  let best = 0
  let bestLen = -1
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y)
    if (len > bestLen) {
      bestLen = len
      best = i
    }
  }
  return at(best)
})
</script>

<template>
  <svg
    v-if="d"
    class="arch-link"
    :viewBox="`0 0 ${arch.cols.value} ${arch.rows.value}`"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <marker
        :id="uid" markerWidth="6" markerHeight="6" refX="5.2" refY="3"
        orient="auto" markerUnits="strokeWidth"
      >
        <path d="M0,0.6 L5.4,3 L0,5.4 z" :fill="STROKE" />
      </marker>
      <marker
        :id="`${uid}-start`" markerWidth="6" markerHeight="6" refX="0.8" refY="3"
        orient="auto" markerUnits="strokeWidth"
      >
        <path d="M6,0.6 L0.6,3 L6,5.4 z" :fill="STROKE" />
      </marker>
    </defs>
    <path
      :d="d"
      fill="none"
      :stroke="STROKE"
      :stroke-width="WIDTH"
      stroke-linejoin="miter"
      stroke-linecap="butt"
      :stroke-dasharray="dashed ? '0.1 0.08' : undefined"
      :marker-end="arrow === 'none' ? undefined : `url(#${uid})`"
      :marker-start="arrow === 'both' ? `url(#${uid}-start)` : undefined"
    />
    <text
      v-if="label && labelPos"
      :x="labelPos.vertical ? labelPos.x + 0.18 : labelPos.x"
      :y="labelPos.vertical ? labelPos.y + 0.06 : labelPos.y - 0.08"
      class="arch-link__label"
      :text-anchor="labelPos.vertical ? 'start' : 'middle'"
    >{{ label }}</text>
  </svg>
</template>

<style scoped>
.arch-link {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.arch-link__label {
  font-size: 0.17px;
  font-weight: 600;
  fill: #4b5563;
  stroke: #ffffff;
  stroke-width: 0.06;
  paint-order: stroke;
}
</style>
