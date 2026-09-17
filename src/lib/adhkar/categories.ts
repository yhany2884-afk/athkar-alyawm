import type { Category, CategoryId } from "./types";
import { dayPeriod, type DayPeriod } from "@/lib/utils";

export const CATEGORIES: Category[] = [
  {
    id: "morning",
    name: "أذكار الصباح",
    blurb: "حصن اليوم من الفجر إلى الزوال",
    when: "من طلوع الفجر إلى ارتفاع الشمس، ويُدرك إلى الزوال",
  },
  {
    id: "evening",
    name: "أذكار المساء",
    blurb: "حصن الليل من العصر إلى المغرب",
    when: "من العصر إلى غروب الشمس، ويُدرك إلى العشاء",
  },
  {
    id: "after-salah",
    name: "أذكار بعد الصلاة",
    blurb: "ما يُقال دبر كل صلاة مكتوبة",
    when: "عقب السلام من الفرائض الخمس",
  },
  {
    id: "salah",
    name: "أذكار الصلاة",
    blurb: "الاستفتاح والركوع والسجود والتشهد",
    when: "أثناء أداء الصلاة",
  },
  {
    id: "sleep",
    name: "أذكار النوم",
    blurb: "ما يُقال عند الاضطجاع",
    when: "عند إرادة النوم على الجانب الأيمن",
  },
  {
    id: "wake",
    name: "أذكار الاستيقاظ",
    blurb: "أول ما يجري على اللسان بعد الانتباه",
    when: "عند الاستيقاظ من النوم",
  },
  {
    id: "food",
    name: "الطعام والشراب",
    blurb: "التسمية والحمد قبل وبعد الأكل",
    when: "عند الأكل والشرب",
  },
  {
    id: "home",
    name: "المنزل والمسجد",
    blurb: "دخول الخلاء والبيت والمسجد والخروج منها",
    when: "عند الدخول والخروج",
  },
  {
    id: "travel",
    name: "السفر والركوب",
    blurb: "دعاء الركوب والسفر والرجوع",
    when: "عند الركوب والسفر",
  },
  {
    id: "distress",
    name: "الهمّ والكرب",
    blurb: "ما يُقال عند الضيق والخوف والحزن",
    when: "عند نزول الهم أو الكرب أو الخوف",
  },
  {
    id: "istighfar",
    name: "الاستغفار والصلاة على النبي",
    blurb: "التوبة والصلاة على رسول الله ﷺ",
    when: "في كل حين، وآكد بعد الصلاة وفي الأسحار",
  },
  {
    id: "quran",
    name: "من القرآن",
    blurb: "آيات جُعلت ذكرًا وحصنًا",
    when: "تُقرأ صباحًا ومساءً وفي الصلاة وعند النوم",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export function periodToCategory(p: DayPeriod): CategoryId {
  if (p === "morning") return "morning";
  if (p === "evening") return "evening";
  return "sleep";
}

export function featuredCategoryId(d = new Date()): CategoryId {
  return periodToCategory(dayPeriod(d));
}
