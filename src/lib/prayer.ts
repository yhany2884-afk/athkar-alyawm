export type PrayerId = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerMethod = "egypt" | "mwl" | "umm" | "karachi";

export const PRAYER_METHODS: { id: PrayerMethod; name: string }[] = [
  { id: "egypt", name: "الهيئة المصرية" },
  { id: "mwl", name: "رابطة العالم" },
  { id: "umm", name: "أم القرى" },
  { id: "karachi", name: "كراتشي" },
];

export const PRAYER_LABEL: Record<PrayerId, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const ANGLES: Record<PrayerMethod, { fajr: number; isha: number | "90m" }> = {
  egypt: { fajr: 19.5, isha: 17.5 },
  mwl: { fajr: 18, isha: 17 },
  umm: { fajr: 18.5, isha: "90m" },
  karachi: { fajr: 18, isha: 18 },
};

const D2R = Math.PI / 180;

function fix360(a: number) {
  a = a % 360;
  return a < 0 ? a + 360 : a;
}

function fixHour(h: number) {
  h = h % 24;
  return h < 0 ? h + 24 : h;
}

function julian(year: number, month: number, day: number) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

function sunPosition(jd: number) {
  const D = jd - 2451545;
  const g = fix360(357.529 + 0.98560028 * D) * D2R;
  const q = fix360(280.459 + 0.98564736 * D);
  const L = fix360(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * D2R;
  const e = (23.439 - 0.00000036 * D) * D2R;
  const RA = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / D2R;
  const eqt = q / 15 - fixHour(RA / 15);
  const decl = Math.asin(Math.sin(e) * Math.sin(L)) / D2R;
  return { decl, eqt };
}

function hourAngle(lat: number, dec: number, angle: number) {
  const a =
    -Math.sin(angle * D2R) -
    Math.sin(lat * D2R) * Math.sin(dec * D2R);
  const b = Math.cos(lat * D2R) * Math.cos(dec * D2R);
  const c = a / b;
  if (c < -1 || c > 1) return 0;
  return Math.acos(c) / D2R / 15;
}

export type PrayerClock = Record<PrayerId, number>;

/** دقائق من منتصف الليل المحلي. الحساب فلكي على الجهاز بلا شبكة. */
export function prayerMinutes(
  lat: number,
  lng: number,
  date = new Date(),
  method: PrayerMethod = "egypt",
): PrayerClock {
  const browserTz = -date.getTimezoneOffset() / 60;
  const tz = browserTz === 0 ? Math.round(lng / 15) : browserTz;
  const j = julian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const jdate = j - lng / 360;
  let noon = 12;
  let decl = 0;
  for (let i = 0; i < 2; i++) {
    const sun = sunPosition(jdate + noon / 24);
    decl = sun.decl;
    noon = fixHour(12 - sun.eqt - lng / 15 + tz);
  }
  const ang = ANGLES[method];
  const rise = hourAngle(lat, decl, 0.833);
  const fajrH = hourAngle(lat, decl, ang.fajr);
  const asrAng =
    -Math.atan(1 / (1 + Math.tan(Math.abs(lat - decl) * D2R))) / D2R;
  const asrH = hourAngle(lat, decl, asrAng);
  const fajr = noon - fajrH;
  const sunrise = noon - rise;
  const dhuhr = noon + 2 / 60;
  const asr = noon + asrH;
  const maghrib = noon + rise;
  const isha =
    ang.isha === "90m" ? maghrib + 1.5 : noon + hourAngle(lat, decl, ang.isha);
  const toMin = (h: number) => Math.round(fixHour(h) * 60);
  return {
    fajr: toMin(fajr),
    sunrise: toMin(sunrise),
    dhuhr: toMin(dhuhr),
    asr: toMin(asr),
    maghrib: toMin(maghrib),
    isha: toMin(isha),
  };
}

export function formatClock(mins: number, style: "ampm" | "ar" = "ampm"): string {
  const m = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  const min = m % 60;
  const pm = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const hh = `${h}:${String(min).padStart(2, "0")}`;
  return style === "ar" ? `${hh} ${pm ? "م" : "ص"}` : `${hh} ${pm ? "PM" : "AM"}`;
}

export function nextPrayer(clock: PrayerClock, now = new Date()) {
  const cur = now.getHours() * 60 + now.getMinutes();
  const order: PrayerId[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  for (const id of order) {
    if (clock[id] > cur) {
      return { id, mins: clock[id], inMin: clock[id] - cur };
    }
  }
  return { id: "fajr" as const, mins: clock.fajr, inMin: 1440 - cur + clock.fajr };
}

export function countdown(totalMin: number, now = new Date()): string {
  const sec = now.getSeconds();
  let left = totalMin * 60 - sec;
  if (left < 0) left = 0;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
