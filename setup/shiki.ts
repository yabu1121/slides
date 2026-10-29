import { defineShikiSetup } from '@slidev/types'

/**
 * コードの色。
 *
 * 既定の vitesse-light は全体に薄く、白地に枠なしで置くとコードの範囲が沈む。
 * github-light-high-contrast は墨が濃く、語ごとの色の差もはっきりしているので、
 * 枠を描かなくても「ここからここまでがコード」と分かる。
 *
 * 太さは styles/index.css の pre で 600 にしてある。
 * 色だけでは客席から見たときに細くて沈む。色と太さの両方で出す。
 *
 * 別のものに変えるときは https://shiki.style/themes の light 系から選ぶ。
 * 暗い色のテーマは入れない。白地の資料なので地と喧嘩する。
 */
export default defineShikiSetup(() => ({
  themes: {
    light: 'github-light-high-contrast',
    dark: 'github-light-high-contrast',
  },
}))
