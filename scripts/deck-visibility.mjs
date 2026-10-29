/*
 * デッキの公開設定を DB（slides.decks）と突き合わせる。
 *
 * 公開ページは静的ビルドの結果なので、admin のトグルはこのビルドが読んで
 * 初めて効く。admin 側はトグルを倒したあと Vercel の Deploy Hook で
 * このビルドを起こしている。
 *
 * 役割分担
 *   このビルド ... slug / title / date / event / frontmatter_draft を書き込む
 *   admin      ... published を倒す（ビルドは published を上書きしない）
 *
 * 非公開のデッキには preview_token を持たせ、/_preview/<token>/ に出す。
 * admin から中身を捲るため。一覧には載らず slug からも推測できないが、
 * **URL を知っていれば誰でも見られる**ので外に出さないこと。
 *
 * 判定
 *   .md に draft: true があれば公開しない（**.md 側が強い**）
 *   publish_at が未来なら、published が true でもまだ公開しない（予約公開）
 *   それ以外は DB の published に従う
 *   **新しいデッキは必ず非公開で登録する。** 公開するかどうかは admin だけが決める。
 *   以前は「.md を置けば出る」を保つために draft でなければ公開で登録していたが、
 *   表示するものは全部 admin から制御する、という方針と制御点が 2 つに割れていた。
 *   push した瞬間に外へ出てしまうと、admin で倒してもビルドが走るまで公開が続く。
 *
 * DATABASE_URL が無いときは .md だけで判定する（手元で中身を見る用）。
 * **設定されているのに繋がらないときはビルドを失敗させる。** 繋がらないことを
 * 理由に .md だけで判定すると、admin で隠したデッキを公開してしまう。
 *
 * 書き込みは本番ビルドとローカルだけ。プレビュー（VERCEL_ENV=preview）では
 * 読むだけにする。デッキを消したブランチのプレビューが、本番の公開設定を
 * 書き換えてしまうため。
 */

// プレビュービルドから本番の設定を触らせない
const canWrite = process.env.VERCEL_ENV !== 'preview';

import { randomUUID } from 'node:crypto';
import postgres from 'postgres';

try {
  process.loadEnvFile('.env.local');
} catch {
  // Vercel では環境変数が直接入る
}

export const resolveVisibility = async (decks) => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.warn('\n[decks] DATABASE_URL が無いので .md の draft だけで判定します');
    return decks.map((deck) => ({ ...deck, visible: !deck.draftInMarkdown, previewToken: null }));
  }

  const sql = postgres(url, { prepare: false, ssl: 'require', max: 1 });

  try {
    if (!canWrite) console.log('[decks] プレビュービルドなので読むだけにします');

    const resolved = [];

    for (const deck of decks) {
      const row = canWrite
        ? (
            await sql`
              insert into slides.decks (slug, title, date, event, published, frontmatter_draft, slide_count, preview_token, missing_at, synced_at)
              values (
                ${deck.slug},
                ${deck.title},
                ${deck.date ?? null},
                ${deck.event ?? null},
                -- **常に非公開で登録する。** 公開は admin のトグルだけが倒す
                false,
                ${deck.draftInMarkdown},
                ${deck.slideCount ?? null},
                ${randomUUID().replace(/-/g, '')},
                null,
                now()
              )
              on conflict (slug) do update set
                title = excluded.title,
                date = excluded.date,
                event = excluded.event,
                frontmatter_draft = excluded.frontmatter_draft,
                slide_count = excluded.slide_count,
                -- 一度決めたトークンは変えない。admin が持っている URL が死ぬ
                preview_token = coalesce(slides.decks.preview_token, excluded.preview_token),
                -- 戻ってきたので「無い」印を外す。**published は触らない**
                missing_at = null,
                -- **tags もここに足さないこと。** admin で付けた値で、.md から
                -- 読んでいるものではない。足すとビルドのたびに消える
                synced_at = now()
              returning published, frontmatter_draft, preview_token, tags,
                (publish_at is not null and publish_at > now()) as waiting
            `
          )[0]
        : (
            await sql`
              select published, frontmatter_draft, preview_token, tags,
                (publish_at is not null and publish_at > now()) as waiting
              from slides.decks where slug = ${deck.slug}
            `
          )[0];

      resolved.push({
        ...deck,
        // 行が無ければ .md の draft に従う（プレビューで新しいデッキを見るとき）
        // .md の draft が強い
        // 時刻の比較は DB の now() でやる。ビルドを走らせた端末の時計に依存させない
        visible: row ? !row.frontmatter_draft && row.published && !row.waiting : !deck.draftInMarkdown,
        waiting: row?.waiting ?? false,
        previewToken: row?.preview_token ?? null,
        // admin で付けたタグ。.md には無いので、行が無ければ空
        tags: row?.tags ?? [],
      });
    }

    /*
     * リポジトリから消えたデッキ。**行は消さない。**
     * 消すと公開設定が失われ、ファイルが戻ったときに「新しいデッキ」として
     * 公開側で登録されてしまう（admin で隠したはずのものが出る）。
     *
     * デッキが 0 本のときは何もしない。slug <> all('{}') は全行に当たるので、
     * 読み取りの失敗や改名の途中で全部の設定を飛ばしてしまう。
     */
    const slugs = decks.map((deck) => deck.slug);

    if (canWrite && slugs.length > 0) {
      const missing = await sql`
        update slides.decks set missing_at = now()
        where missing_at is null and slug <> all(${sql.array(slugs)})
        returning slug
      `;
      if (missing.length) {
        console.log(`[decks] .md が見つからないデッキに印を付けました: ${missing.map((r) => r.slug).join(', ')}`);
      }
    }

    return resolved;
  } finally {
    await sql.end();
  }
};
