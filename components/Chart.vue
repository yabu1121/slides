<!--
  グラフ。ECharts を資料の配色と字で包んである。

    <Chart :option="{ xAxis: { data: [...] }, series: [...] }" :h="280" />

  ---- props ---------------------------------------------------------
    option  ECharts の option。色や字は書かない。指定が無ければ資料の設定が入る
    h       高さ px（既定 280）
    w       幅 px。省くと親いっぱい

  ---- 書くもの / 書かないもの ---------------------------------------
  書くのは **データと軸のラベルだけ**。
  色・フォント・目盛り線・凡例の形は components/chart-theme.ts が決める。
  option に color や itemStyle の色を書かない。資料の 2 色から外れる。

  系列を分けたいときは series の順番で決まる。
    1 本目 墨 / 2 本目 空色の濃い方 / 3 本目 灰 / 4 本目 空色
  **4 本を超えたら系列を減らす。** 色で区別できる本数を超えている。

  ---- 使える種類 ----------------------------------------------------
  line / bar / pie / scatter / radar / boxplot / heatmap /
  funnel / sankey / gauge / treemap と、markLine・markArea・markPoint。
  他の種類を足すときは下の import と echarts.use に 1 行ずつ加える。
  **3D と地図は入れない。** 白地に緑 2 色の設計から外れ、客席から読めない。

  ---- 高さ ----------------------------------------------------------
  1 枚に 1 つなら 280〜320。2 つ並べるなら 180 前後。
  ダッシュボードのように 6 つ置くなら 120 前後まで落とす。
-->
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onSlideEnter } from '@slidev/client'
import * as echarts from 'echarts/core'
import {
  BarChart,
  BoxplotChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreemapChart,
} from 'echarts/charts'
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  RadarComponent,
  VisualMapComponent,
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { SVGRenderer } from 'echarts/renderers'
import { withBase } from './chart-theme'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  BoxplotChart,
  HeatmapChart,
  FunnelChart,
  SankeyChart,
  GaugeChart,
  TreemapChart,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  GraphicComponent,
  RadarComponent,
  VisualMapComponent,
  LabelLayout,
  SVGRenderer,
])

const props = withDefaults(defineProps<{
  /** ECharts の option。色と字は書かない */
  option: Record<string, any>
  /** 高さ px */
  h?: number
  /** 幅 px。省くと親いっぱい */
  w?: number
}>(), { h: 280 })

const el = ref<HTMLDivElement>()
let chart: echarts.ECharts | undefined
let observer: ResizeObserver | undefined
let lastW = 0
let lastH = 0

function ready() {
  if (!el.value || !el.value.clientWidth)
    return false
  chart ??= echarts.init(el.value, undefined, { renderer: 'svg' })
  return true
}

/**
 * 描く。
 *   replay = true  いったん消してから描き直す。入りの動きがもう一度走る
 *   replay = false 今の絵に重ねる。足した markLine だけがあとから出る
 */
function draw(replay = false) {
  if (!ready())
    return
  if (replay)
    chart!.clear()
  chart!.setOption(withBase(props.option), true)
  lastW = el.value!.clientWidth
  lastH = el.value!.clientHeight
}

/*
 * スライドに入るたび最初から描き直す。
 *
 * Slidev は次のスライドを先に組み立てておくので、何もしないと
 * 画面に出る前に動きが終わっていて、めくった時には止まった絵しか見えない。
 * onSlideEnter はマウント時にも 1 回呼ばれる。
 */
onSlideEnter(() => {
  nextTick(() => draw(true))
})

/*
 * 幅が決まる前に init すると、ECharts は 0 幅で作られて潰れたまま残る。
 * ResizeObserver で、幅が決まった時点で作り直す。
 * **大きさが変わっていないときは触らない。** resize を挟むと入りの動きが途切れる。
 */
onMounted(async () => {
  await nextTick()
  draw(true)
  observer = new ResizeObserver(() => {
    const w = el.value?.clientWidth ?? 0
    const h = el.value?.clientHeight ?? 0
    if (!w || (w === lastW && h === lastH))
      return
    if (!chart)
      draw(true)
    else
      chart.resize()
    lastW = w
    lastH = h
  })
  if (el.value)
    observer.observe(el.value)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = undefined
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = undefined
  lastW = 0
  lastH = 0
})

function resize() {
  chart?.resize()
}

watch(() => props.option, () => draw(false), { deep: true })
</script>

<template>
  <div ref="el" :style="{ height: `${props.h}px`, width: props.w ? `${props.w}px` : '100%' }"></div>
</template>
