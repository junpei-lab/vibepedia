import type { CollectionEntry } from 'astro:content';

export interface CategorySummary {
  name: string;
  slug: string;
  count: number;
}

export const categoryToSlug = (category: string): string => category.trim();

export const buildCategorySummariesFromArticles = (
  articles: CollectionEntry<'articles'>[]
): CategorySummary[] => {
  const categoryCounts = new Map<string, number>();

  for (const article of articles) {
    const categoryName = article.data.category.trim();
    if (categoryName.length === 0) continue;
    categoryCounts.set(categoryName, (categoryCounts.get(categoryName) ?? 0) + 1);
  }

  return [...categoryCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ja'))
    .map(([name, count]) => ({
      name,
      slug: categoryToSlug(name),
      count,
    }));
};
