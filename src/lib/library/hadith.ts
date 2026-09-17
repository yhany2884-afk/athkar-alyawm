import type { BookInfo } from "./types";
import meta from "./hadith-meta.json";

const BASE: Omit<BookInfo, "extra" | "chapterTitles" | "lazy">[] = [
  {
    id: "bukhari",
    shelf: "hadith",
    title: "صحيح البخاري",
    author: "الإمام محمد بن إسماعيل البخاري",
    blurb: "الجامع المسند الصحيح كاملًا.",
  },
  {
    id: "muslim",
    shelf: "hadith",
    title: "صحيح مسلم",
    author: "الإمام مسلم بن الحجاج",
    blurb: "المسند الصحيح كاملًا.",
  },
  {
    id: "abudawud",
    shelf: "hadith",
    title: "سنن أبي داود",
    author: "الإمام أبو داود السجستاني",
    blurb: "السنن كاملة على أبواب الفقه.",
  },
  {
    id: "tirmidhi",
    shelf: "hadith",
    title: "جامع الترمذي",
    author: "الإمام أبو عيسى الترمذي",
    blurb: "الجامع كامل الأبواب.",
  },
  {
    id: "nasai",
    shelf: "hadith",
    title: "سنن النسائي",
    author: "الإمام أحمد بن شعيب النسائي",
    blurb: "المجتبى من السنن كاملًا.",
  },
  {
    id: "ibnmajah",
    shelf: "hadith",
    title: "سنن ابن ماجه",
    author: "الإمام ابن ماجه القزويني",
    blurb: "السنن كاملة.",
  },
  {
    id: "malik",
    shelf: "hadith",
    title: "موطأ مالك",
    author: "الإمام مالك بن أنس",
    blurb: "الموطأ كامل الأبواب.",
  },
  {
    id: "riyadh",
    shelf: "hadith",
    title: "رياض الصالحين",
    author: "يحيى بن شرف النووي",
    blurb: "الكتاب كامل بأبوابه وأحاديثه.",
  },
  {
    id: "bulugh",
    shelf: "hadith",
    title: "بلوغ المرام",
    author: "ابن حجر العسقلاني",
    blurb: "أحاديث الأحكام كاملة على أبواب الفقه.",
  },
  {
    id: "nawawi",
    shelf: "hadith",
    title: "الأربعون النووية",
    author: "يحيى بن شرف النووي",
    blurb: "اثنان وأربعون حديثًا بتمام ألفاظها.",
  },
  {
    id: "qudsi",
    shelf: "hadith",
    title: "الأربعون القدسية",
    author: "مما يرويه النبي ﷺ عن ربه",
    blurb: "أربعون حديثًا قدسيًا كاملة.",
  },
];

function arExtra(count: number, books: number): string {
  const d = "٠١٢٣٤٥٦٧٨٩";
  const ar = (n: number) => String(n).replace(/\d/g, (c) => d[Number(c)]);
  if (books <= 1 || books === count) return `${ar(count)} حديثًا`;
  return `${ar(count)} حديثًا · ${ar(books)} كتابًا`;
}

export const HADITH_INFO: BookInfo[] = BASE.map((b) => {
  const m = (meta as Record<string, { count: number; books: number; titles: string[] }>)[b.id];
  return {
    ...b,
    extra: m ? arExtra(m.count, m.books) : "",
    lazy: true,
    chapterTitles: m?.titles ?? [],
  };
});
