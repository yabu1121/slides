<!--
  AWS サービスなどの「箱」。アイコン1つとラベルを描く。

  x, y は中心の座標（グリッド単位）。ArchLink でつなぐなら id を必ず付ける。

    <ArchNode id="alb" icon="aws-elb" label="ALB" sub="HTTPS" :x="5.3" :y="1.65" />

  icon の書き方:
    "aws-ec2"     -> AWS アイコン（logos コレクション）
    "carbon:user" -> ほかのアイコンは `コレクション:名前` で指定
  アイコン名の一覧は node_modules/@iconify-json/logos/icons.json の aws-* を見る。

  アイコンを自前の図に差し替えたいときは既定スロットに入れる。
-->
<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

const props = withDefaults(defineProps<{
  /** ArchLink からつなぐための名前。つながないなら不要 */
  id?: string
  /** 中心の x 座標（グリッド単位） */
  x: number
  /** 中心の y 座標（グリッド単位） */
  y: number
  /** アイコン名 */
  icon?: string
  /** 名前 */
  label?: string
  /** 名前の下の補足 */
  sub?: string
  /** アイコン枠の一辺（グリッド単位） */
  size?: number
  /** ラベルの位置 */
  labelPos?: 'bottom' | 'top' | 'right' | 'none'
}>(), { size: 0.62, labelPos: 'bottom' })

const arch = inject<any>('arch')

const iconClass = computed(() => {
  if (!props.icon)
    return ''
  return props.icon.includes(':')
    ? `i-${props.icon.replace(':', '-')}`
    : `i-logos-${props.icon}`
})

// ラベルの実寸を測る。線がラベルを突き抜けないようにするため
const labelEl = ref<HTMLElement>()
const labelW = ref(0)
const labelH = ref(0)
let ro: ResizeObserver | undefined

onMounted(() => {
  if (!labelEl.value)
    return
  ro = new ResizeObserver(([entry]) => {
    labelW.value = entry.contentRect.width
    labelH.value = entry.contentRect.height
  })
  ro.observe(labelEl.value)
})

/** ラベルが張り出す量（グリッド単位）。0.18rem の隙間込み */
const labelExtent = computed(() => {
  const unit = arch.unit.value
  if (!unit)
    return { w: 0, h: 0 }
  const gapPx = 0.18 * 16
  return {
    w: (labelW.value + gapPx) / unit,
    h: (labelH.value + gapPx) / unit,
  }
})

// ArchLink が線の端点を計算するために位置と占有範囲を登録する
let registered: string | undefined

watchEffect(() => {
  if (registered && registered !== props.id) {
    arch.boxes.delete(registered)
    registered = undefined
  }
  if (!props.id)
    return
  const half = props.size / 2
  const pos = props.labelPos
  const ext = labelExtent.value
  arch.boxes.set(props.id, {
    x: props.x,
    y: props.y,
    left: half,
    right: half + (pos === 'right' ? ext.w : 0),
    top: half + (pos === 'top' ? ext.h : 0),
    bottom: half + (pos === 'bottom' ? ext.h : 0),
  })
  registered = props.id
})

onBeforeUnmount(() => {
  ro?.disconnect()
  if (registered)
    arch.boxes.delete(registered)
})

const boxStyle = computed(() => ({
  left: `${(props.x / arch.cols.value) * 100}%`,
  top: `${(props.y / arch.rows.value) * 100}%`,
  width: `${(props.size / arch.cols.value) * 100}%`,
}))
</script>

<template>
  <div class="arch-node" :style="boxStyle">
    <div class="arch-node__box">
      <slot>
        <span v-if="iconClass" :class="iconClass" class="arch-node__icon" />
      </slot>
    </div>
    <div v-if="label && labelPos !== 'none'" ref="labelEl" class="arch-node__label" :class="`is-${labelPos}`">
      <div class="arch-node__name">{{ label }}</div>
      <div v-if="sub" class="arch-node__sub">{{ sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.arch-node {
  position: absolute;
  z-index: 2;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
}

.arch-node__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.arch-node__icon {
  width: 82%;
  height: 82%;
}

.arch-node__label {
  position: absolute;
  text-align: center;
  line-height: 1.25;
  white-space: nowrap;
  color: var(--c-ink);
}

.arch-node__label.is-bottom {
  top: calc(100% + 0.18rem);
  left: 50%;
  transform: translateX(-50%);
}

.arch-node__label.is-top {
  bottom: calc(100% + 0.18rem);
  left: 50%;
  transform: translateX(-50%);
}

.arch-node__label.is-right {
  left: calc(100% + 0.3rem);
  top: 50%;
  transform: translateY(-50%);
  text-align: left;
}

.arch-node__name {
  font-size: 0.6rem;
  font-weight: 600;
}

.arch-node__sub {
  font-size: 0.54rem;
  color: var(--c-ink-3);
}
</style>
