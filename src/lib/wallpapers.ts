export type BuiltinWallpaper = {
  id: string;
  name: string;
  src: string;
  place?: string;
};

export const BUILTIN_WALLPAPERS: BuiltinWallpaper[] = [
  { id: "none", name: "سادة", src: "" },
  {
    id: "haram",
    name: "المسجد الحرام",
    src: "/wallpapers/haram.jpg",
    place: "الكعبة المشرّفة · مكة",
  },
  {
    id: "nabawi",
    name: "المسجد النبوي",
    src: "/wallpapers/nabawi.jpg",
    place: "المدينة المنورة",
  },
  {
    id: "aqsa",
    name: "قبة الصخرة",
    src: "/wallpapers/aqsa.jpg",
    place: "المسجد الأقصى · القدس",
  },
  {
    id: "qubbah",
    name: "بيت المقدس",
    src: "/wallpapers/qubbah.jpg",
    place: "القدس الشريف",
  },
  {
    id: "zellij",
    name: "زليج المسجد",
    src: "/wallpapers/zellij.jpg",
    place: "نقش إسلامي",
  },
];

export const WALLPAPER_BY_ID = Object.fromEntries(
  BUILTIN_WALLPAPERS.map((w) => [w.id, w]),
);
