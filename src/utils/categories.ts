import type { CollectionEntry } from 'astro:content';

export interface CategoryNode {
  name: string;
  slug: string;
  parentName?: string;
  description?: string;
}

export const categoryToSlug = (category: string): string => category.trim();

export interface CategoryHierarchy {
  byName: Map<string, CategoryNode>;
  roots: CategoryNode[];
  children: Map<string, CategoryNode[]>;
  directArticleCount: Map<string, number>;
  directArticlesByCategory: Map<string, CollectionEntry<'articles'>[]>;
}

export const getCategoryAncestors = (
  category: CategoryNode,
  byName: Map<string, CategoryNode>
): CategoryNode[] => {
  const ancestors: CategoryNode[] = [];
  const visited = new Set<string>([category.name]);
  let currentCategory: CategoryNode | undefined = category;

  while (currentCategory?.parentName) {
    const parentCategory = byName.get(currentCategory.parentName);
    if (!parentCategory || visited.has(parentCategory.name)) {
      break;
    }
    ancestors.unshift(parentCategory);
    visited.add(parentCategory.name);
    currentCategory = parentCategory;
  }

  return ancestors;
};

export const countDescendantCategories = (
  categoryName: string,
  children: Map<string, CategoryNode[]>
): number => {
  const childCategories = children.get(categoryName) ?? [];
  let total = childCategories.length;

  for (const childCategory of childCategories) {
    total += countDescendantCategories(childCategory.name, children);
  }

  return total;
};

export const countSubtreeArticles = (
  categoryName: string,
  children: Map<string, CategoryNode[]>,
  directArticleCount: Map<string, number>
): number => {
  const childCategories = children.get(categoryName) ?? [];
  let total = directArticleCount.get(categoryName) ?? 0;

  for (const childCategory of childCategories) {
    total += countSubtreeArticles(childCategory.name, children, directArticleCount);
  }

  return total;
};

const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

const findCyclePath = (path: string[], name: string): string => {
  const cycleStart = path.indexOf(name);
  if (cycleStart === -1) return [...path, name].join(' -> ');
  return [...path.slice(cycleStart), name].join(' -> ');
};

const validateCategoryCycles = (byName: Map<string, CategoryNode>): void => {
  const visitState = new Map<string, 0 | 1 | 2>();

  const visit = (name: string, path: string[]): void => {
    const state = visitState.get(name) ?? 0;

    if (state === 1) {
      throw new Error(`[categories] Parent cycle detected: ${findCyclePath(path, name)}.`);
    }

    if (state === 2) {
      return;
    }

    visitState.set(name, 1);

    const parentName = byName.get(name)?.parentName;
    if (parentName) {
      visit(parentName, [...path, parentName]);
    }

    visitState.set(name, 2);
  };

  for (const categoryName of byName.keys()) {
    visit(categoryName, [categoryName]);
  }
};

export const buildCategoryHierarchy = (
  categories: CollectionEntry<'categories'>[],
  articles: CollectionEntry<'articles'>[]
): CategoryHierarchy => {
  const byName = new Map<string, CategoryNode>();
  const children = new Map<string, CategoryNode[]>();
  const directArticleCount = new Map<string, number>();
  const directArticlesByCategory = new Map<string, CollectionEntry<'articles'>[]>();

  for (const categoryEntry of categories) {
    const name = categoryEntry.data.name.trim();

    if (name.length === 0) {
      throw new Error(`[categories] Empty category name in "${categoryEntry.id}".`);
    }

    if (byName.has(name)) {
      throw new Error(`[categories] Duplicate category name "${name}".`);
    }

    const parentName = categoryEntry.data.parent?.trim();
    const description = categoryEntry.data.description?.trim();

    byName.set(name, {
      name,
      slug: categoryToSlug(name),
      parentName: parentName && parentName.length > 0 ? parentName : undefined,
      description: description && description.length > 0 ? description : undefined,
    });

    children.set(name, []);
    directArticlesByCategory.set(name, []);
    directArticleCount.set(name, 0);
  }

  for (const category of byName.values()) {
    if (!category.parentName) continue;

    if (!byName.has(category.parentName)) {
      throw new Error(
        `[categories] Category "${category.name}" references unknown parent "${category.parentName}".`
      );
    }

    if (category.parentName === category.name) {
      throw new Error(`[categories] Category "${category.name}" cannot be its own parent.`);
    }

    children.get(category.parentName)?.push(category);
  }

  validateCategoryCycles(byName);

  for (const article of articles) {
    const categoryName = article.data.category.trim();

    if (categoryName.length === 0) {
      throw new Error(`[categories] Article "${article.id}" has an empty category.`);
    }

    if (!byName.has(categoryName)) {
      throw new Error(
        `[categories] Article "${article.id}" references undefined category "${categoryName}".`
      );
    }

    directArticlesByCategory.get(categoryName)?.push(article);
  }

  for (const [name, categoryChildren] of children.entries()) {
    children.set(name, sortByName(categoryChildren));
  }

  for (const [name, categoryArticles] of directArticlesByCategory.entries()) {
    categoryArticles.sort((a, b) => b.data.lastmod.getTime() - a.data.lastmod.getTime());
    directArticleCount.set(name, categoryArticles.length);
  }

  const roots = sortByName([...byName.values()].filter((category) => !category.parentName));

  return {
    byName,
    roots,
    children,
    directArticleCount,
    directArticlesByCategory,
  };
};
