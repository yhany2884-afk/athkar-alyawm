import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { byCategory } from "@/lib/adhkar";
import {
  countdown,
  formatClock,
  nextPrayer,
  prayerMinutes,
  PRAYER_LABEL,
  type PrayerId,
  type PrayerMethod,
} from "@/lib/prayer";
import { SURAHS } from "@/lib/quran/meta";
import { useAppStore } from "@/lib/store";
import { periodGreeting } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const ORDER: PrayerId[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

function Home() {
  const lastSurah = useAppStore((s) => s.lastSurah);
  const lastAyah = useAppStore((s) => s.lastAyah);
  const quranStarted = useAppStore((s) => s.quranStarted);
  const qibla = useAppStore((s) => s.qibla);
  const progress = useAppStore((s) => s.progress);
  const settings = useAppStore((s) => s.settings);
  const method = settings.prayerMethod ?? "egypt";
  const round = settings.cardRound ?? 24;
  const clockStyle = settings.clockStyle ?? "ampm";
  const [periodNow, setPeriodNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setPeriodNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const place = "موقعك";
  const lat = qibla?.lat ?? 30.0444;
  const lng = qibla?.lng ?? 31.2357;
  const greet = periodGreeting(periodNow);
  const showAdhkar = settings.homeAdhkar !== false;
  const showProgress = settings.homeProgress !== false;
  const showContinue = settings.homeContinue !== false;
  const sky = settings.prayerSky !== false;

  const track = useMemo(() => {
    const items = [...byCategory("morning"), ...byCategory("evening")];
    const done = items.filter((d) => (progress[d.id] ?? 0) >= d.count).length;
    const total = items.length || 1;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [progress]);

  const last = SURAHS.find((s) => s.id === lastSurah);
  const started = quranStarted || (lastSurah ?? 1) > 1 || (lastAyah ?? 1) > 1;
  const ayahPct = last ? Math.min(100, Math.round((lastAyah / last.count) * 100)) : 0;
  const r = `${round}px`;
  const resumeName = last?.name ?? "الفاتحة";

  return (
    <AppShell title="أذكار اليوم" wordmark>
      <main className="space-y-3 px-4 pt-2 pb-4">
        <PrayerHero
          lat={lat}
          lng={lng}
          method={method}
          clockStyle={clockStyle}
          place={place}
          sky={sky}
          round={r}
        />

        {showAdhkar ? (
          <Link
            to="/today"
            className="home-soft tap flex items-center gap-3 px-4 py-3.5"
            style={{ borderRadius: r }}
          >
            <span className="grid size-12 place-items-center rounded-full bg-white/80 text-accent">
              <Moon />
            </span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-lg font-semibold">{greet.title}</span>
              <span className="block text-xs text-muted">{greet.sub}</span>
            </span>
            <Chevron />
          </Link>
        ) : null}

        {showProgress ? (
          <section className="home-card grid grid-cols-[auto_1fr] items-center gap-3 px-4 py-4" style={{ borderRadius: r, direction: "ltr" }}>
            <div
              className="progress-ring grid size-[5.4rem] place-items-center text-lg font-semibold text-fg"
              style={{ ["--p" as string]: `${track.pct}`, direction: "rtl" }}
            >
              {track.pct}%
            </div>
            <div className="min-w-0 border-s border-fg/10 ps-3" style={{ direction: "rtl" }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">تقدمك اليوم</p>
                <Spark />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                تقدمك في الورد والأذكار والحفظ
              </p>
              <p className="mt-1 text-xs text-muted">
                أنجزت {track.done} من {track.total}
              </p>
            </div>
          </section>
        ) : null}

        {showContinue ? (
          <Link
            to="/quran/$n"
            params={{ n: String(last?.id ?? 1) }}
            search={{ ayah: lastAyah || 1 }}
            className="home-card tap block px-4 py-4"
            style={{ borderRadius: r }}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-accent">
                <Book />
              </span>
              <span className="min-w-0 flex-1 text-right">
                <span className="block text-lg font-semibold">أكمل تلاوتك</span>
                <span className="mt-0.5 block text-sm font-medium text-fg">
                  {started ? `متابعة سورة ${resumeName}` : "افتح المصحف وسجّل أول موضع قراءة"}
                </span>
                {started ? (
                  <span className="mt-0.5 block text-xs text-muted">
                    الآية {lastAyah || 1} من {last?.count ?? 7}
                  </span>
                ) : null}
              </span>
            </div>
            <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-surface">
              <span className="block h-full rounded-full bg-accent" style={{ width: `${started ? ayahPct : 4}%` }} />
            </span>
          </Link>
        ) : null}
      </main>
    </AppShell>
  );
}

function PrayerHero({
  lat,
  lng,
  method,
  clockStyle,
  place,
  sky,
  round,
}: {
  lat: number;
  lng: number;
  method: PrayerMethod;
  clockStyle: "ampm" | "ar";
  place: string;
  sky: boolean;
  round: string;
}) {
  const [now, setNow] = useState(() => new Date());
  const [timesOpen, setTimesOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const clock = useMemo(
    () => prayerMinutes(lat, lng, now, method),
    [lat, lng, method, now.getFullYear(), now.getMonth(), now.getDate()],
  );
  const next = nextPrayer(clock, now);

  return (
    <section
      className={sky ? "prayer-hero relative overflow-hidden text-white" : "prayer-hero is-flat relative overflow-hidden text-white"}
      style={{ borderRadius: round }}
    >
      <div className="relative z-10 p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm text-white/90">
            الصلاة القادمة
            <Bell />
          </p>
          <Link
            to="/qibla"
            className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs"
          >
            <span>{place}</span>
            <Pin />
          </Link>
        </div>
        <p className="mt-7 text-start font-arabic text-[3.15rem] leading-none">{PRAYER_LABEL[next.id]}</p>
        <p className="mt-2 text-start text-[2.05rem] font-semibold tracking-tight">
          <bdi dir="ltr">{formatClock(next.mins, clockStyle)}</bdi>
        </p>
        <p className="mt-2 flex items-center justify-start gap-2 text-sm text-white/85">
          <span>متبقي</span>
          <span className="tabular-nums" dir="ltr">{countdown(next.inMin, now)}</span>
          <Hourglass />
        </p>
        <div className="mt-5 flex items-center justify-between gap-2 text-sm">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-white/95"
            onClick={() => setTimesOpen((v) => !v)}
          >
            <Calendar />
            <span>الصلاة التالية</span>
          </button>
          <span className="text-white/90">الشروق</span>
          <span className="rounded-full bg-black/30 px-3 py-1 text-sm font-medium">
            <bdi dir="ltr">{formatClock(clock.sunrise, clockStyle)}</bdi>
          </span>
        </div>
        {timesOpen ? (
          <ul className="mt-3 grid grid-cols-2 gap-1.5 text-sm">
            {ORDER.map((id) => (
              <li
                key={id}
                className={
                  id === next.id
                    ? "flex justify-between rounded-xl bg-white/20 px-2.5 py-1.5"
                    : "flex justify-between rounded-xl bg-black/20 px-2.5 py-1.5 text-white/85"
                }
              >
                <span>{PRAYER_LABEL[id]}</span>
                <bdi dir="ltr" className="tabular-nums">{formatClock(clock[id], clockStyle)}</bdi>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function Pin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}
function Moon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}
function Book() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 5.2h6.2A2.3 2.3 0 0 1 13 7.5V19H7.2A2.7 2.7 0 0 1 4.5 16.3V5.2z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.5 5.2h-6.2A2.3 2.3 0 0 0 11 7.5V19h5.8a2.7 2.7 0 0 0 2.7-2.7V5.2z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted" aria-hidden="true">
      <path d="M14.5 6.5 8.5 12l6 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Bell() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 16V10a6 6 0 1 1 12 0v6l1.2 2H4.8L6 16z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function Hourglass() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8M16 4c0 4-8 4-8 8s8 4 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function Calendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5V7M16 3.5V7M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function Spark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
      <path d="M4 16l5-5 3 3 7-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
