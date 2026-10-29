<!--
  全スライドの最前面に重なる層。Slidev がファイル名で拾うので import は要らない。
  今はページ番号だけを置いている。

  **global-bottom.vue ではない。** bottom は画面の下ではなく重なりの下で、
  スライドの地（方眼紙）に隠れて何も見えない。

  ---- 出さないページ ------------------------------------------------
  表紙（layout: cover）と章扉（layout: section）、
  それと締め（class: ending）には出さない。
  表紙に番号があると資料っぽくなり、章扉は静けさが役目なので何も足さない。
  締めに番号があると、まだ続きがあるように見える。

  MEMO: 右下・12px・番号だけ、は自分の判断。
        「12 / 52」のように総数を出す案もあるが、
        残りが少ないと分かると聞き手が終わりを待つので番号だけにした。
        質疑で「◯ページの」と言えれば足りる、という前提。
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { currentSlideNo, currentSlideRoute } = useNav()

const hidden = computed(() => {
  const fm = currentSlideRoute.value?.meta?.slide?.frontmatter as any
  // 締めのページは class: ending を付けて番号を消す
  return fm?.layout === 'cover' || fm?.layout === 'section' || String(fm?.class ?? '').includes('ending')
})
</script>

<template>
  <div v-if="!hidden" class="slide-no">{{ currentSlideNo }}</div>
</template>

<style scoped>
.slide-no {
  position: absolute;
  right: 1.6rem;
  bottom: 1rem;
  font-size: 0.75rem;
  line-height: 1;
  color: var(--c-ink-3);
  user-select: none;
}
</style>
