<!--
  public/illust/ にある素材を一覧で出す。
  ファイルを足せば自動で並ぶので、手で書き足さない。

    <IllustIndex />                      1 ページ目（20 点）
    <IllustIndex :page="2" />            2 ページ目
    <IllustIndex :cols="10" :per="20" /> 並べ方を変える

  点数が増えたら page を足したスライドを作る。
  このページは出典を出す場所でもある。消さない。
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 何ページ目を出すか。1 から数える */
  page?: number
  /** 1 ページに並べる数 */
  per?: number
  /** 横に並べる数 */
  cols?: number
  /** サムネイルの幅 px */
  size?: number
}>(), { page: 1, per: 20, cols: 10, size: 78 })

/* ビルド時にフォルダを読む。public/ は Vite が中身を出力しないので名前だけ使う */
const modules = import.meta.glob('/public/illust/*.{png,svg,jpg,jpeg,webp}')

const all = computed(() =>
  Object.keys(modules)
    .map(p => p.replace('/public/illust/', ''))
    .sort()
    .map(file => ({ file, name: file.replace(/\.[^.]+$/, '') })),
)

const items = computed(() => all.value.slice((props.page - 1) * props.per, props.page * props.per))
const pages = computed(() => Math.max(1, Math.ceil(all.value.length / props.per)))
</script>

<template>
  <div>
    <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }">
      <div v-for="i in items" :key="i.file" class="flex flex-col items-center">
        <img
          :src="`/illust/${i.file}`" :style="{ width: `${size}px` }" alt=""
          style="filter: hue-rotate(162deg) saturate(1.15)"
        />
        <div class="u-12 u-faint mt-1 text-center leading-tight">{{ i.name }}</div>
      </div>
    </div>
    <div class="u-12 u-faint mt-6 flex items-baseline gap-5">
      <span>{{ all.length }} 点中 {{ (page - 1) * per + 1 }}–{{ (page - 1) * per + items.length }}（{{ page }} / {{ pages }}）</span>
      <span class="ml-auto">
        イラスト：<a href="https://loosedrawing.com/" target="_blank">Loose Drawing</a>
      </span>
    </div>
  </div>
</template>
