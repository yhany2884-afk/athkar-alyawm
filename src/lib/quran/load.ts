import raw from "./quran.json";

export type QuranSurah = {
  id: number;
  name: string;
  latin: string;
  type: "m" | "d";
  verses: string[];
};

/** Full Hafs/Uthmani text, bundled with the app — no network after first load. */
export const QURAN: QuranSurah[] = raw as QuranSurah[];

if (QURAN.length !== 114) {
  throw new Error("مصحف ناقص");
}

const BY_ID = new Map<number, QuranSurah>(QURAN.map((s) => [s.id, s]));

const BASMALA_RE = /^بِسۡمِ[\s\S]{0,40}?ٱلرَّحِيمِ\s*/u;

export function stripLeadingBasmala(text: string): string {
  const trimmed = text.replace(BASMALA_RE, "").trim();
  return trimmed || text;
}

export function loadQuran(): QuranSurah[] {
  return QURAN;
}

export function loadSurah(n: number): QuranSurah | undefined {
  if (!Number.isFinite(n)) return undefined;
  return BY_ID.get(n);
}

export function searchQuran(
  q: string,
  limit = 40,
): { surah: number; name: string; ayah: number; text: string }[] {
  const needle = q.trim();
  if (needle.length < 2) return [];
  const hits: { surah: number; name: string; ayah: number; text: string }[] = [];
  for (const s of QURAN) {
    if (s.name.includes(needle) && hits.length < limit) {
      hits.push({
        surah: s.id,
        name: s.name,
        ayah: 1,
        text: s.verses[0] ?? "",
      });
    }
    for (let i = 0; i < s.verses.length; i++) {
      if (hits.length >= limit) return hits;
      const text = s.verses[i];
      if (text.includes(needle)) {
        hits.push({ surah: s.id, name: s.name, ayah: i + 1, text });
      }
    }
    if (hits.length >= limit) break;
  }
  return hits;
}
