export type ShelfId = "aqidah" | "fiqh" | "hadith";

export type HadithItem = {
  n: number;
  text: string;
};

export type Chapter = {
  id: string;
  title: string;
  body?: string;
  source?: string;
  items?: HadithItem[];
};

export type Book = {
  id: string;
  shelf: ShelfId;
  title: string;
  author: string;
  blurb: string;
  chapters: Chapter[];
};

export type BookInfo = {
  id: string;
  shelf: ShelfId;
  title: string;
  author: string;
  blurb: string;
  extra: string;
  lazy?: boolean;
  chapterTitles?: string[];
};

export const SHELVES: { id: ShelfId; name: string; blurb: string }[] = [
  {
    id: "aqidah",
    name: "كتب العقيدة",
    blurb: "التوحيد وأصول الإيمان من القرآن والسنة",
  },
  {
    id: "fiqh",
    name: "كتب الفقه والشرع",
    blurb: "أحكام العبادات والمعاملات من الدليل",
  },
  {
    id: "hadith",
    name: "كتب الحديث",
    blurb: "الصحاح والسنن والموطأ والمتون كاملة بألفاظها",
  },
];
