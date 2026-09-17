/** إحداثيات الكعبة (نفس موضع خرائط جوجل) — الحساب محلي بلا شبكة. */
export const KAABA = {
  lat: 21.422487,
  lng: 39.826206,
};

export const CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "الجيزة", lat: 30.0131, lng: 31.2089 },
  { name: "القاهرة", lat: 30.0444, lng: 31.2357 },
  { name: "الإسكندرية", lat: 31.2001, lng: 29.9187 },
  { name: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
  { name: "المدينة المنورة", lat: 24.4672, lng: 39.6024 },
  { name: "الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", lat: 21.4858, lng: 39.1925 },
  { name: "عمّان", lat: 31.9454, lng: 35.9284 },
  { name: "دمشق", lat: 33.5138, lng: 36.2765 },
  { name: "القدس", lat: 31.7683, lng: 35.2137 },
  { name: "بغداد", lat: 33.3152, lng: 44.3661 },
  { name: "الكويت", lat: 29.3759, lng: 47.9774 },
  { name: "الدوحة", lat: 25.2854, lng: 51.531 },
  { name: "أبوظبي", lat: 24.4539, lng: 54.3773 },
  { name: "صنعاء", lat: 15.3694, lng: 44.191 },
  { name: "الخرطوم", lat: 15.5007, lng: 32.5599 },
  { name: "تونس", lat: 36.8065, lng: 10.1815 },
  { name: "الجزائر", lat: 36.7538, lng: 3.0588 },
  { name: "الرباط", lat: 34.0209, lng: -6.8416 },
  { name: "إسطنبول", lat: 41.0082, lng: 28.9784 },
];

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

export function norm360(n: number): number {
  return ((n % 360) + 360) % 360;
}

/** أقصر فرق زاوي من a إلى b في المدى −١٨٠…١٨٠. */
export function angleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export function lerpAngle(a: number, b: number, t: number): number {
  return norm360(a + angleDelta(a, b) * t);
}

/** اتجاه القبلة بالدرجات من الشمال الجغرافي. */
export function qiblaBearing(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return norm360(toDeg(Math.atan2(y, x)));
}

export function distanceKm(lat: number, lng: number): number {
  const R = 6371.0088;
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δφ = toRad(KAABA.lat - lat);
  const Δλ = toRad(KAABA.lng - lng);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * انحراف مغناطيسي تقريبي (شرق موجب) من شبكة WMM للمنطقة الإسلامية وما حولها.
 * البوصلة مغناطيسية؛ القبلة جغرافية — نضيف هذا التصحيح محليًا دون إنترنت.
 */
export function magneticDeclination(lat: number, lon: number): number {
  const lats = [-20, 0, 20, 40, 60];
  const lons = [-80, -40, 0, 40, 80, 120];
  const g = [
    [-18, -8, -4, -2, 1, 3],
    [-12, -5, -1, 2, 1, 1],
    [-8, -1, 3, 4, 2, 0],
    [-12, 2, 4, 6, 3, -4],
    [-16, 0, 2, 8, 2, -10],
  ];
  const clat = Math.max(lats[0], Math.min(lats[lats.length - 1], lat));
  const clon = Math.max(lons[0], Math.min(lons[lons.length - 1], lon));
  let i = 0;
  while (i < lats.length - 2 && clat > lats[i + 1]) i++;
  let j = 0;
  while (j < lons.length - 2 && clon > lons[j + 1]) j++;
  const ty = (clat - lats[i]) / (lats[i + 1] - lats[i] || 1);
  const tx = (clon - lons[j]) / (lons[j + 1] - lons[j] || 1);
  const v00 = g[i][j];
  const v10 = g[i][j + 1];
  const v01 = g[i + 1][j];
  const v11 = g[i + 1][j + 1];
  return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;
}

/** اتجاه الجهاز من أحداث البوصلة (شمال مغناطيسي). */
export function headingFromEvent(e: DeviceOrientationEvent): number | null {
  const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
  if (typeof ev.webkitCompassHeading === "number" && !Number.isNaN(ev.webkitCompassHeading)) {
    return norm360(ev.webkitCompassHeading);
  }
  if (e.alpha == null) return null;
  const fromEuler = compassFromEuler(e.alpha, e.beta ?? 0, e.gamma ?? 0);
  return norm360(fromEuler + screenOffset());
}

function screenOffset(): number {
  const so = window.screen?.orientation?.angle;
  if (typeof so === "number") return so;
  const wo = (window as Window & { orientation?: number }).orientation;
  return typeof wo === "number" ? wo : 0;
}

/** من مواصفة W3C / Compass.js — أدق من alpha وحده عند إمالة الهاتف. */
function compassFromEuler(alpha: number, beta: number, gamma: number): number {
  const _x = toRad(beta);
  const _y = toRad(gamma);
  const _z = toRad(alpha);
  const cX = Math.cos(_x);
  const cY = Math.cos(_y);
  const cZ = Math.cos(_z);
  const sX = Math.sin(_x);
  const sY = Math.sin(_y);
  const sZ = Math.sin(_z);
  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;
  return toDeg(Math.atan2(Vx, Vy));
}

export function formatDeg(n: number): string {
  const d = "٠١٢٣٤٥٦٧٨٩";
  return Math.round(n)
    .toString()
    .replace(/\d/g, (c) => d[Number(c)]) + "°";
}

export function cardinalAr(deg: number): string {
  const dirs = [
    "شمال",
    "شمال شرق",
    "شرق",
    "جنوب شرق",
    "جنوب",
    "جنوب غرب",
    "غرب",
    "شمال غرب",
  ];
  return dirs[Math.round(norm360(deg) / 45) % 8] ?? "شمال";
}

export function turnHint(delta: number): { aligned: boolean; text: string } {
  const a = Math.abs(delta);
  if (a <= 6) return { aligned: true, text: "أنت تواجه القبلة" };
  if (delta > 0) return { aligned: false, text: `انعطف يمينًا ${formatDeg(a)}` };
  return { aligned: false, text: `انعطف يسارًا ${formatDeg(a)}` };
}
