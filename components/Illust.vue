<!--
  本文ページに差し込むイラスト。

    <Illust src="/illust/meeting.png" />       public/illust/ の画像を使う
    <Illust src="/illust/meeting.png" :w="220" />  幅を変える
    <Illust src="/illust/meeting.png" inline />    絶対配置をやめて、その場に流し込む
    <Illust src="/illust/coding.png" raw />        素材の色をそのまま使う

  ---- 素材 ----------------------------------------------------------
  Loose Drawing（https://loosedrawing.com/）の素材を public/illust/ に置いて
  src で呼ぶ。素材は黒い線と黄色の 2 色なので、既定では色相をずらして
  テンプレートの空色に寄せている。黄色のまま出したいときだけ raw を付ける。
  素材の一覧と約束ごとは public/illust/README.md を見る。

  **自前の線画は持たない。** 以前は SVG を 6 つ内蔵していたが、
  Loose Drawing と線の太さも塗りの有無も違い、同じ資料に 2 系統の絵が
  混ざって見えたのでやめた。絵は Loose Drawing に一本化する。

  ---- 使いどころ ----------------------------------------------------
  文字まわりのページのように、右側が空いている本文ページに 1 点だけ置く。
  **章扉には置かない。** タイトルだけの静けさが章扉の役目。
  **コードとアーキテクチャのページにも置かない。**
  コードは吹き出しで、図は AWS の色付きアイコンで、すでに埋まっている。

  ---- 守ること ------------------------------------------------------
  ・1 枚に 1 点まで
  ・幅は 260〜360
  ・同じページで tabler のアイコンと混ぜない。線の太さが違う
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** public/illust/ に置いた画像のパス */
  src: string
  /** 幅 px。260 前後で使う */
  w?: number
  /** 絶対配置をやめて、その場に流し込む */
  inline?: boolean
  /** 素材の色をそのまま使う。既定は空色に寄せる */
  raw?: boolean
}>(), { w: 260, inline: false, raw: false })

/* 素材の黄色を空色へ回す。線は無彩色なので影響を受けない */
const TINT = 'hue-rotate(162deg) saturate(1.15)'

const style = computed(() => props.inline
  ? { width: `${props.w}px` }
  : {
      position: 'absolute' as const,
      right: '3.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      width: `${props.w}px`,
    })
</script>

<template>
  <img :src="src" :style="[style, raw ? {} : { filter: TINT }]" alt="" />
</template>
