import { defineConfig } from 'unocss'

/**
 * ArchNode / ArchGroup の icon 属性に書かれたアイコンを UnoCSS に拾わせる。
 *
 *   icon="aws-ec2"     -> i-logos-aws-ec2   （接頭辞なしは AWS アイコン扱い）
 *   icon="carbon:user" -> i-carbon-user     （`:` を含む場合はそのまま）
 *
 * これがないと動的な class 名が生成されずアイコンが消える。
 */
export default defineConfig({
  extractors: [
    {
      name: 'arch-icon',
      extract({ code }) {
        const found: string[] = []
        for (const m of code.matchAll(/\bicon=["']([\w:-]+)["']/g)) {
          const raw = m[1]
          found.push(raw.includes(':') ? `i-${raw.replace(':', '-')}` : `i-logos-${raw}`)
        }
        return found
      },
    },
  ],
})
