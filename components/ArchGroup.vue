<!--
  ネットワーク境界などの「枠」。必ず長方形で描かれる。

  x, y は左上の座標、w, h は幅と高さ。すべて Arch のグリッド単位。

    <ArchGroup type="vpc" label="VPC" sub="10.0.0.0/16" :x="3.5" :y="0.65" :w="6.8" :h="3.6" />

  type ごとに AWS の配色が決まっているので、色は指定しない。
  枠が足りなければ type="plain" を使うか、ここに type を1つ足す。
-->
<script setup lang="ts">
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  /** 枠の種類。色と線種が決まる */
  type?:
    | 'cloud' | 'region' | 'az' | 'vpc'
    | 'public-subnet' | 'private-subnet'
    | 'security-group' | 'asg' | 'account' | 'plain'
  /** 枠の名前 */
  label?: string
  /** 名前の下に出す補足。CIDR など */
  sub?: string
  /** ラベル左のアイコン。省略可 */
  icon?: string
  /** 左上の x 座標（グリッド単位） */
  x: number
  /** 左上の y 座標（グリッド単位） */
  y: number
  /** 幅（グリッド単位） */
  w: number
  /** 高さ（グリッド単位） */
  h: number
}>(), { type: 'plain' })

const arch = inject<any>('arch')

/** type ごとの見た目。AWS Architecture Icons の配色に合わせてある */
const STYLES: Record<string, { color: string, dashed?: boolean, tint?: string }> = {
  'cloud': { color: '#232F3E' },
  'region': { color: '#147EBA', dashed: true },
  'az': { color: '#147EBA', dashed: true },
  'vpc': { color: '#8C4FFF' },
  'public-subnet': { color: '#7AA116', tint: 'rgba(122, 161, 22, 0.07)' },
  'private-subnet': { color: '#00A4A6', tint: 'rgba(0, 164, 166, 0.07)' },
  'security-group': { color: '#DD3522', dashed: true },
  'asg': { color: '#ED7100', dashed: true },
  'account': { color: '#E7157B' },
  'plain': { color: '#cfd4da' },
}

const style = computed(() => STYLES[props.type] ?? STYLES.plain)

const iconClass = computed(() => {
  if (!props.icon)
    return ''
  return props.icon.includes(':')
    ? `i-${props.icon.replace(':', '-')}`
    : `i-logos-${props.icon}`
})

const boxStyle = computed(() => ({
  left: `${(props.x / arch.cols.value) * 100}%`,
  top: `${(props.y / arch.rows.value) * 100}%`,
  width: `${(props.w / arch.cols.value) * 100}%`,
  height: `${(props.h / arch.rows.value) * 100}%`,
  borderColor: style.value.color,
  borderStyle: style.value.dashed ? 'dashed' : 'solid',
  background: style.value.tint ?? 'transparent',
}))
</script>

<template>
  <div class="arch-group" :style="boxStyle">
    <div v-if="label" class="arch-group__label" :style="{ color: style.color }">
      <span v-if="iconClass" :class="iconClass" class="arch-group__icon" />
      <span class="arch-group__name">{{ label }}</span>
      <span v-if="sub" class="arch-group__sub">{{ sub }}</span>
    </div>
  </div>
</template>

<style scoped>
.arch-group {
  position: absolute;
  z-index: 0;
  border-width: 1.5px;
  border-radius: 3px;
  box-sizing: border-box;
}

.arch-group__label {
  position: absolute;
  top: 0.28rem;
  left: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.6rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.arch-group__icon {
  width: 0.78rem;
  height: 0.78rem;
}

.arch-group__sub {
  font-weight: 400;
  opacity: 0.75;
}
</style>
