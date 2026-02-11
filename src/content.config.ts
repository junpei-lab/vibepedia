// vibepedia コンテンツコレクション定義
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 記事コレクション: src/content/articles/ 配下のMarkdownファイルを管理
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lastmod: z.coerce.date(),
    featured: z.boolean().default(false),
    views: z.number().int().nonnegative().default(0),
    category: z.string(),
    image: z.string().optional(),
    slug: z.string().optional(),
    isDayArticle: z.boolean().default(false),
    // 「今日は何の日」用イベントデータ（MM-DD形式）
    events: z
      .array(
        z.object({
          date: z.string(),
          text: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { articles };
