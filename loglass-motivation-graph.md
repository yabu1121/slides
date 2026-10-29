---
theme: default
title: Motivation Graph
drawings:
  persist: false
transition: none
mdc: true
---

<script setup>
const option = {
  animation: false,
  grid: { left: 8, right: 16, top: 24, bottom: 84, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [
      '幼少〜小\nピアノ・テニス',
      '2018.04\nソフトテニス',
      '2021.12\n弓道開始',
      '2022.04\n早気',
      '2022.10\n早気克服',
      '2023.02\n弓道引退',
      '2024.04\nWeb・軽音',
      '2025.11\nニフロ',
      '2026.08\nサマーインターン',
      '2026.10\n本選考',
    ],
    axisLabel: { interval: 0, lineHeight: 18, fontSize: 11, margin: 18 },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 10,
    interval: 2,
  },
  series: [{
    type: 'line',
    data: [7, 8, 10, 3, 8, 4, 7, 7, 8, 4],
    symbol: 'circle',
    symbolSize: 14,
    showSymbol: true,
    lineStyle: { width: 5, color: 'accentInk' },
    itemStyle: { color: 'bg', borderColor: 'accentInk', borderWidth: 4 },
    label: { show: true, position: 'top', fontSize: 14, fontWeight: 'bold', color: 'accentInk' },
  }],
}
</script>

<div class="absolute left-14 right-14 top-[54%] -translate-y-1/2">
  <Chart :option="option" :h="440" />
</div>
