#!/usr/bin/env node
/**
 * Markdown 記事を Sanity の post ドキュメントとして投入する CLI。
 *
 *   node scripts/post-to-sanity.mjs article.md              # 下書き（drafts.*）として作成
 *   node scripts/post-to-sanity.mjs article.md --publish    # 公開ドキュメントとして作成
 *   node scripts/post-to-sanity.mjs article.md --dry-run    # 変換結果を JSON で表示するだけ
 *
 * frontmatter:
 *   ---
 *   title: 記事タイトル
 *   slug: miura-diving-xxxx-2026-08-01
 *   publishedAt: 2026-08-01T09:00:00Z   # 省略時は _createdAt が使われる
 *   mainImage: ./images/hero.jpg        # ローカルパス（md からの相対）
 *   ---
 *
 * 書き込みトークンは SANITY_WRITE_TOKEN、または ~/.config/sanity/miura-write-token から読む。
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { homedir } from 'node:os';
import { randomBytes } from 'node:crypto';

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'd2w2igz6';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = process.env.SANITY_API_VERSION || '2025-02-19';
const TOKEN_FILE = resolve(homedir(), '.config/sanity/miura-write-token');
const SITE_ORIGIN = 'https://miura-diving.com';

const key = () => randomBytes(6).toString('hex');
const rewrittenLinks = [];

// ---------------------------------------------------------------- frontmatter

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim().replace(/^["'](.*)["']$/, '$1');
    meta[kv[1]] = v;
  }
  return { meta, body: raw.slice(m[0].length) };
}

// ------------------------------------------------------------- inline parsing

/**
 * `**bold**` / `*em*` / `` `code` `` / `[text](url)` を span + markDefs に変換する。
 */
function inlineToSpans(text) {
  const markDefs = [];
  const children = [];
  const pattern = /(\*\*(.+?)\*\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\(([^)\s]+?)\))|(\*(.+?)\*)|(__(.+?)__)/g;
  let last = 0;
  let m;

  const push = (t, marks) => {
    if (!t) return;
    children.push({ _key: key(), _type: 'span', marks, text: t });
  };

  while ((m = pattern.exec(text)) !== null) {
    push(text.slice(last, m.index), []);
    if (m[1]) push(m[2], ['strong']);
    else if (m[3]) push(m[4], ['code']);
    else if (m[5]) {
      const defKey = key();
      // 相対パスは Sanity 側で解決できずリンク切れになるため絶対 URL に正規化する
      let href = m[7];
      if (href.startsWith('/')) {
        href = SITE_ORIGIN + href;
        rewrittenLinks.push(`${m[7]} → ${href}`);
      }
      markDefs.push({ _key: defKey, _type: 'link', href });
      push(m[6], [defKey]);
    } else if (m[8]) push(m[9], ['em']);
    else if (m[10]) push(m[11], ['strong']);
    last = m.index + m[0].length;
  }
  push(text.slice(last), []);

  if (children.length === 0) push('', []);
  return { children, markDefs };
}

const block = (text, style = 'normal', listItem) => {
  const { children, markDefs } = inlineToSpans(text);
  const b = { _key: key(), _type: 'block', style, children, markDefs };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
};

// -------------------------------------------------------------- block parsing

/**
 * Markdown 本文を Portable Text の配列に変換する。
 * 画像は { __localImage: path } のプレースホルダとして残し、後段でアップロードする。
 */
function markdownToPortableText(md) {
  const out = [];
  const lines = md.split(/\r?\n/);
  let para = [];

  const flush = () => {
    if (para.length) {
      out.push(block(para.join(' ').trim()));
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (t === '') { flush(); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flush(); continue; } // hr はスキーマに無いので落とす

    // 単独行の画像 ![alt](src)
    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      flush();
      out.push({ _key: key(), _type: 'image', __localImage: img[2], __alt: img[1] });
      continue;
    }

    const heading = t.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      // 記事タイトルは frontmatter 側なので、本文の # は h2 相当に寄せる
      const level = Math.min(Math.max(heading[1].length, 2), 4);
      out.push(block(heading[2].trim(), `h${level}`));
      continue;
    }

    if (/^>\s?/.test(t)) {
      flush();
      out.push(block(t.replace(/^>\s?/, ''), 'blockquote'));
      continue;
    }

    const bullet = t.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      flush();
      out.push(block(bullet[1], 'normal', 'bullet'));
      continue;
    }

    const numbered = t.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flush();
      out.push(block(numbered[1], 'normal', 'number'));
      continue;
    }

    para.push(t);
  }
  flush();
  return out;
}

// ---------------------------------------------------------------- sanity http

function readToken() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN.trim();
  if (existsSync(TOKEN_FILE)) return readFileSync(TOKEN_FILE, 'utf8').trim();
  throw new Error(
    `Sanity の書き込みトークンが見つかりません。\n` +
      `  https://www.sanity.io/manage/project/${PROJECT_ID}/api で Editor 権限のトークンを作り、\n` +
      `  次のコマンドで保存してください:\n` +
      `    mkdir -p ~/.config/sanity && printf '%s' 'sk...' > ${TOKEN_FILE} && chmod 600 ${TOKEN_FILE}`
  );
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
};

async function uploadImage(path, token) {
  const ext = extname(path).toLowerCase();
  const type = MIME[ext];
  if (!type) throw new Error(`対応していない画像形式です: ${path}`);
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent(basename(path))}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': type },
    body: readFileSync(path),
  });
  if (!res.ok) throw new Error(`画像アップロード失敗 (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.document._id;
}

async function mutate(mutations, token) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}?returnIds=true`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Sanity mutation 失敗 (${res.status}): ${await res.text()}`);
  return res.json();
}

// ----------------------------------------------------------------------- main

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('-'));
  const publish = args.includes('--publish');
  const dryRun = args.includes('--dry-run');

  if (!file) {
    console.error('使い方: node scripts/post-to-sanity.mjs <article.md> [--publish] [--dry-run]');
    process.exit(1);
  }

  const mdPath = resolve(file);
  const { meta, body } = parseFrontmatter(readFileSync(mdPath, 'utf8'));

  if (!meta.title) throw new Error('frontmatter に title がありません');
  if (!meta.slug) throw new Error('frontmatter に slug がありません');

  const blocks = markdownToPortableText(body);
  const imageBlocks = blocks.filter((b) => b.__localImage);

  if (rewrittenLinks.length) {
    console.error(`ℹ️  相対リンクを絶対 URL に修正しました (${rewrittenLinks.length}件):`);
    for (const r of rewrittenLinks) console.error(`   ${r}`);
  }

  const doc = {
    _type: 'post',
    title: meta.title,
    slug: { _type: 'slug', current: meta.slug },
    body: blocks,
  };
  // publishedAt: 既存スキルの frontmatter は `date: 2026-08-01` 形式なので両方受ける
  const when = meta.publishedAt || meta.date;
  if (when) doc.publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(when) ? `${when}T09:00:00.000Z` : when;

  if (dryRun) {
    console.log(JSON.stringify({ ...doc, __images: imageBlocks.map((b) => b.__localImage) }, null, 2));
    console.error(`\n[dry-run] ブロック数: ${blocks.length} / 画像: ${imageBlocks.length}`);
    return;
  }

  const token = readToken();

  // slug 重複チェック（下書き・公開の両方）
  const q = encodeURIComponent(`*[_type=="post" && slug.current==$slug]{_id}`);
  const params = `&$slug=${encodeURIComponent(JSON.stringify(meta.slug))}`;
  const checkRes = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${q}${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const check = await checkRes.json();
  if (check.result?.length) {
    throw new Error(`slug "${meta.slug}" は既に存在します: ${check.result.map((r) => r._id).join(', ')}`);
  }

  // 画像アップロード → 参照に差し替え
  for (const b of imageBlocks) {
    const abs = resolve(dirname(mdPath), b.__localImage);
    if (!existsSync(abs)) throw new Error(`画像が見つかりません: ${abs}`);
    process.stderr.write(`画像アップロード中: ${basename(abs)} ... `);
    const assetId = await uploadImage(abs, token);
    delete b.__localImage;
    delete b.__alt;
    b.asset = { _type: 'reference', _ref: assetId };
    process.stderr.write('ok\n');
  }

  if (meta.mainImage) {
    const abs = resolve(dirname(mdPath), meta.mainImage);
    if (!existsSync(abs)) throw new Error(`mainImage が見つかりません: ${abs}`);
    process.stderr.write(`メイン画像アップロード中: ${basename(abs)} ... `);
    const assetId = await uploadImage(abs, token);
    doc.mainImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId } };
    process.stderr.write('ok\n');
  }

  if (!publish) doc._id = `drafts.${crypto.randomUUID()}`;

  const result = await mutate([{ create: doc }], token);
  const id = result.results?.[0]?.id ?? '(unknown)';

  if (publish) {
    console.log(`✅ 公開ドキュメントを作成しました: ${id}`);
    console.log(`   反映するにはデプロイが必要です: npm run deploy:remote`);
  } else {
    console.log(`📝 下書きを作成しました: ${id}`);
    console.log(`   Studio で確認 → https://miura-blog.vercel.app/structure`);
    console.log(`   Studio の Publish を押すまでサイトには出ません。`);
  }
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});
