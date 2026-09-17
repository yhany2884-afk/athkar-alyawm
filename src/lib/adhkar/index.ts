import type { CategoryId, Dhikr, UserDhikr } from "./types";
import { CORE_ADHKAR } from "./data-core";
import { LIFE_ADHKAR } from "./data-life";

export const ORIGINAL_ADHKAR: Dhikr[] = [...CORE_ADHKAR, ...LIFE_ADHKAR];

const BY_ID = new Map(ORIGINAL_ADHKAR.map((d) => [d.id, d]));

export function getOriginal(id: string): Dhikr | undefined {
  return BY_ID.get(id);
}

export function mergeAdhkar(custom: UserDhikr[]): Dhikr[] {
  const extras: Dhikr[] = custom.map((c) => ({
    id: c.id,
    title: c.title,
    arabic: c.arabic,
    count: Math.max(1, c.count),
    when: c.when || "حسب ما تيسّر",
    sourceKind: "hadith",
    sourceRef: "إضافة شخصية",
    source: c.source || "ذكر شخصي — ليس من المتون الأصلية",
    meaning: c.meaning,
    categories: c.categories.length ? c.categories : ["istighfar"],
    locked: false,
  }));
  return [...ORIGINAL_ADHKAR, ...extras];
}

export function byId(id: string, custom: UserDhikr[] = []): Dhikr | undefined {
  return mergeAdhkar(custom).find((d) => d.id === id);
}

export function byCategory(
  category: CategoryId,
  custom: UserDhikr[] = [],
): Dhikr[] {
  return mergeAdhkar(custom).filter((d) => d.categories.includes(category));
}

export function searchAdhkar(q: string, custom: UserDhikr[] = []): Dhikr[] {
  const needle = q.trim();
  if (!needle) return [];
  return mergeAdhkar(custom).filter((d) => {
    const hay = `${d.title} ${d.arabic} ${d.meaning} ${d.source} ${d.sourceRef} ${d.when}`;
    return hay.includes(needle);
  });
}

export function playlistFor(
  ids: string[],
  custom: UserDhikr[] = [],
): Dhikr[] {
  const all = mergeAdhkar(custom);
  return ids
    .map((id) => all.find((d) => d.id === id))
    .filter((d): d is Dhikr => Boolean(d));
}

export { CATEGORIES, CATEGORY_MAP, featuredCategoryId } from "./categories";
export type { CategoryId, Dhikr, UserDhikr, Category } from "./types";
