import { defineMermaidSetup } from '@slidev/types'

/**
 * Mermaid のテーマ。シーケンス図と状態遷移図で使う。
 *
 * 色は styles/index.css の :root と同じ値を手で写してある。
 * Mermaid は CSS 変数を解釈しないので、ここだけは実際の色を書く。
 * **トークンを変えたらここも一緒に直す。**
 *
 * MEMO: 枠は薄い空色の面 + 墨の線、矢印は灰、というのは自分で決めた配色。
 *       アーキテクチャ図（AWS 配色）とは別系統になっている。
 *       図の種類ごとに色が違うのは気になるかもしれないので要相談。
 */
export default defineMermaidSetup(() => {
  return {
    theme: 'base',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif',
    themeVariables: {
      background: '#ffffff',
      // 箱
      primaryColor: '#e6f6fc', // --c-accent-soft
      primaryTextColor: '#16191d', // --c-ink
      primaryBorderColor: '#1b7ea3', // --c-accent-ink
      secondaryColor: '#f7f8fa', // --c-surface
      secondaryTextColor: '#16191d',
      secondaryBorderColor: '#cfd4da', // --c-border-strong
      tertiaryColor: '#ffffff',
      tertiaryTextColor: '#16191d',
      tertiaryBorderColor: '#e4e7eb', // --c-border
      // 線と文字
      lineColor: '#8b949e', // --c-ink-3
      textColor: '#16191d',
      mainBkg: '#e6f6fc',
      nodeBorder: '#1b7ea3',
      clusterBkg: '#f7f8fa',
      clusterBorder: '#e4e7eb',
      edgeLabelBackground: '#ffffff',
      fontSize: '15px',
      // シーケンス図
      actorBkg: '#e6f6fc',
      actorBorder: '#1b7ea3',
      actorTextColor: '#16191d',
      actorLineColor: '#cfd4da',
      signalColor: '#4b5563', // --c-ink-2
      signalTextColor: '#16191d',
      labelBoxBkgColor: '#f0f2f5', // --c-surface-2
      labelBoxBorderColor: '#cfd4da',
      labelTextColor: '#16191d',
      loopTextColor: '#4b5563',
      noteBkgColor: '#f7f8fa',
      noteBorderColor: '#cfd4da',
      noteTextColor: '#4b5563',
      activationBkgColor: '#cbe9f5', // --c-cover-band
      activationBorderColor: '#1b7ea3',
      // 状態遷移図
      transitionColor: '#8b949e',
      transitionLabelColor: '#4b5563',
    },
    flowchart: {
      useMaxWidth: true,
      curve: 'linear',
      padding: 12,
    },
    sequence: {
      useMaxWidth: true,
      actorMargin: 90,
      boxMargin: 12,
      mirrorActors: false,
      bottomMarginAdj: 0,
      messageFontSize: 14,
      actorFontSize: 15,
      noteFontSize: 13,
    },
  }
})
