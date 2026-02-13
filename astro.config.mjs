// @ts-check
import { defineConfig } from 'astro/config';
import remarkWikiLink from 'remark-wiki-link';

function normalizeBasePath(pathValue) {
  if (!pathValue || pathValue === '/') {
    return '/';
  }

  const trimmed = pathValue.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

const repository = process.env.GITHUB_REPOSITORY ?? '';
const [owner = '', repo = ''] = repository.split('/');
const isProjectPage = owner && repo && repo !== `${owner}.github.io`;

const site = process.env.SITE_URL ?? (owner ? `https://${owner}.github.io` : undefined);
const base = normalizeBasePath(process.env.BASE_PATH ?? (isProjectPage ? repo : '/'));

// vibepedia - GitHub Pages対応Astro設定
export default defineConfig({
  site,
  base,
  markdown: {
    remarkPlugins: [
      [
        remarkWikiLink,
        {
          // [[記事名]] を既存ルーティング /articles/:slug に変換する
          pageResolver: (name) => [name.trim()],
          hrefTemplate: (permalink) => `${base}articles/${encodeURIComponent(permalink)}`,
          // Obsidian互換の [[ページ名|表示名]] を使えるようにする
          aliasDivider: '|',
        },
      ],
    ],
  },
});
