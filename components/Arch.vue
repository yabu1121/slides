<!--
  アーキテクチャ図の台紙。

  座標はグリッド単位で指定する。左上が (0, 0)、右下が (cols, rows)。
  cols : rows が図の縦横比になるので、スライドに収めるなら 2 : 1 前後にする。

  配置に迷ったら guide を付けるとグリッドが出る（発表時は必ず外す）。

  使い方:
    <Arch :cols="11" :rows="5.5" guide>
      <ArchGroup type="vpc" label="VPC" :x="1" :y="1" :w="8" :h="3" />
      <ArchNode id="alb" icon="aws-elb" label="ALB" :x="3" :y="2.5" />
      <ArchNode id="ecs" icon="aws-ecs" label="ECS" :x="6" :y="2.5" />
      <ArchLink from="alb" to="ecs" />
    </Arch>

  重なり順は ArchGroup（下） → ArchLink（中） → ArchNode（上）で固定。
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref } from 'vue'

const props = withDefaults(defineProps<{
  /** 横のグリッド数 */
  cols?: number
  /** 縦のグリッド数 */
  rows?: number
  /** グリッド線を表示する。配置を決めるときだけ使う */
  guide?: boolean
}>(), { cols: 11, rows: 5.5, guide: false })

/**
 * ArchNode が自分の位置と占有範囲を登録する場所。ArchLink が線の端点に使う。
 * left / right / top / bottom は中心から辺までの距離（グリッド単位）。
 * ラベルの分だけ広がるので、線がラベルを突き抜けない。
 */
export interface ArchBox {
  x: number
  y: number
  left: number
  right: number
  top: number
  bottom: number
}

const boxes = reactive(new Map<string, ArchBox>())

// px とグリッド単位を変換するために実寸を測る
const root = ref<HTMLElement>()
const width = ref(0)
let ro: ResizeObserver | undefined

onMounted(() => {
  if (!root.value)
    return
  ro = new ResizeObserver(([entry]) => {
    width.value = entry.contentRect.width
  })
  ro.observe(root.value)
  width.value = root.value.clientWidth
})

onBeforeUnmount(() => ro?.disconnect())

provide('arch', {
  cols: computed(() => props.cols),
  rows: computed(() => props.rows),
  /** グリッド1単位あたりの px。測り終わるまでは 0 */
  unit: computed(() => (width.value ? width.value / props.cols : 0)),
  boxes,
})

const guideLines = computed(() => {
  const v = Array.from({ length: Math.floor(props.cols) }, (_, i) => i + 1)
  const h = Array.from({ length: Math.floor(props.rows) }, (_, i) => i + 1)
  return { v, h }
})
</script>

<template>
  <div ref="root" class="arch" :style="{ aspectRatio: `${cols} / ${rows}` }">
    <svg
      v-if="guide"
      class="arch__guide"
      :viewBox="`0 0 ${cols} ${rows}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <line v-for="x in guideLines.v" :key="`v${x}`" :x1="x" y1="0" :x2="x" :y2="rows" />
      <line v-for="y in guideLines.h" :key="`h${y}`" x1="0" :y1="y" :x2="cols" :y2="y" />
    </svg>
    <slot />
  </div>
</template>

<style scoped>
.arch {
  position: relative;
  width: 100%;
  margin-inline: auto;
}

.arch__guide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.arch__guide line {
  stroke: #d8dde3;
  stroke-width: 0.006;
  stroke-dasharray: 0.06 0.06;
}
</style>
