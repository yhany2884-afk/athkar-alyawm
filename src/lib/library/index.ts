import type { Book, BookInfo, ShelfId } from "./types";
import { AQIDAH_BOOKS } from "./aqidah";
import { FIQH_BOOKS } from "./fiqh";
import { HADITH_INFO } from "./hadith";

const jsonLoaders = import.meta.glob("./data/*.json");

function infoFromMutun(b: Book): BookInfo {
  const nHadith = b.chapters.reduce(
    (n, c) => n + (c.items?.length ?? 0),
    0,
  );
  return {
    id: b.id,
    shelf: b.shelf,
    title: b.title,
    author: b.author,
    blurb: b.blurb,
    extra: nHadith
      ? `${nHadith} حديثًا`
      : `${b.chapters.length} فصول`,
  };
}

export const BOOKS: BookInfo[] = [
  ...AQIDAH_BOOKS.map(infoFromMutun),
  ...FIQH_BOOKS.map(infoFromMutun),
  ...HADITH_INFO,
];

const MUTUN: Book[] = [...AQIDAH_BOOKS, ...FIQH_BOOKS];
const MUTUN_BY_ID = new Map(MUTUN.map((b) => [b.id, b]));
const INFO_BY_ID = new Map(BOOKS.map((b) => [b.id, b]));

export function bookInfo(id: string): BookInfo | undefined {
  return INFO_BY_ID.get(id);
}

export function booksOn(shelf: ShelfId): BookInfo[] {
  return BOOKS.filter((b) => b.shelf === shelf);
}

export async function loadBook(id: string): Promise<Book | undefined> {
  const mutun = MUTUN_BY_ID.get(id);
  if (mutun) return mutun;
  const key = `./data/${id}.json`;
  const loader = jsonLoaders[key];
  if (!loader) return undefined;
  try {
    const mod = (await loader()) as { default: Book };
    return mod.default;
  } catch {
    return undefined;
  }
}

export function searchBooks(q: string) {
  const needle = q.trim();
  if (!needle) return [];
  const hits: { book: BookInfo; chapterTitle: string; snippet: string }[] =
    [];
  for (const b of BOOKS) {
    if (
      b.title.includes(needle) ||
      b.author.includes(needle) ||
      b.blurb.includes(needle)
    ) {
      hits.push({ book: b, chapterTitle: b.title, snippet: b.blurb });
    }
    if (b.chapterTitles) {
      for (const t of b.chapterTitles) {
        if (t.includes(needle)) {
          hits.push({ book: b, chapterTitle: t, snippet: t });
        }
      }
    }
    if (hits.length >= 30) return hits;
  }
  for (const b of MUTUN) {
    for (const c of b.chapters) {
      const blob = `${c.title}\n${c.body ?? ""}`;
      if (blob.includes(needle)) {
        const i = blob.indexOf(needle);
        hits.push({
          book: INFO_BY_ID.get(b.id)!,
          chapterTitle: c.title,
          snippet: blob.slice(Math.max(0, i - 24), i + 90),
        });
      }
      if (hits.length >= 30) return hits;
    }
  }
  return hits;
}

export { SHELVES } from "./types";
export type { Book, BookInfo, Chapter, ShelfId } from "./types";
