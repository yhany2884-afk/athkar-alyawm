/** إحداثيات الكعبة كما تنشرها قبلة جوجل. الحساب محلي بلا شبكة. */
export const KAABA = {
  lat: 21.4225,
  lng: 39.8262,
};

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

/**
 * اتجاه القبلة من الشمال الجغرافي.
 * نفس معادلة قبلة جوجل:
 * atan2( sin(λك − λ) , cos φ · tan φك − sin φ · cos(λك − λ) )
 */
export function qiblaBearing(lat: number, lng: number): number {
  const φ = toRad(lat);
  const φk = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ) * Math.tan(φk) - Math.sin(φ) * Math.cos(Δλ);
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

export type HeadingFix = { deg: number; magnetic: boolean };

/**
 * اتجاه أعلى الشاشة.
 * آيفون: webkitCompassHeading (شمال مغناطيسي) كما تفعل قبلة جوجل.
 * أندرويد: deviceorientationabsolute بمعادلة البوصلة من مواصفة W3C (شمال حقيقي).
 */
export function headingFromEvent(e: DeviceOrientationEvent): HeadingFix | null {
  const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
  if (typeof ev.webkitCompassHeading === "number" && !Number.isNaN(ev.webkitCompassHeading)) {
    return { deg: norm360(ev.webkitCompassHeading), magnetic: true };
  }
  if (e.absolute !== true || e.alpha == null) return null;
  return {
    deg: norm360(compassFromEuler(e.alpha, e.beta ?? 0, e.gamma ?? 0)),
    magnetic: false,
  };
}

/** من مثال البوصلة في مواصفة الاتجاه: اتجاه المستخدم والهاتف أمام وجهه. */
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
  if (Math.abs(Vx) < 1e-6 && Math.abs(Vy) < 1e-6) return norm360(360 - alpha);
  let h = Math.atan2(Vx, Vy);
  return toDeg(h);
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
