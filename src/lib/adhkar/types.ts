export const CATEGORY_IDS = [
  "morning",
  "evening",
  "after-salah",
  "salah",
  "sleep",
  "wake",
  "food",
  "home",
  "travel",
  "distress",
  "istighfar",
  "quran",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type SourceKind = "quran" | "hadith";

export type Dhikr = {
  id: string;
  title: string;
  arabic: string;
  count: number;
  when: string;
  sourceKind: SourceKind;
  sourceRef: string;
  source: string;
  meaning: string;
  fadl?: string;
  categories: CategoryId[];
  locked: boolean;
};

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  when: string;
};

export type UserDhikr = {
  id: string;
  title: string;
  arabic: string;
  count: number;
  when: string;
  source: string;
  meaning: string;
  categories: CategoryId[];
  locked: false;
};
