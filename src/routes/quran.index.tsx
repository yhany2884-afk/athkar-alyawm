import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { TocRow } from "@/components/toc-row";
import { QURAN } from "@/lib/quran/load";
import { SURAHS } from "@/lib/quran/meta";
import { JUZ } from "@/lib/quran/juz";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quran/")({ component: QuranIndex });

const AYAH_TOTAL = QURAN.reduce((n, s) => n + s.verses.length, 0);

function QuranIndex() {
  const lastSurah = useAppStore((s) => s.lastSurah);
  const lastAyah = useAppStore((s) => s.lastAyah);
  const [tab, setTab] = useState<"suwar" | "juz">("suwar");
  const last = SURAHS.find((s) => s.id === lastSurah);

  const byJuz = useMemo(() => {
    return JUZ.map((j) => {
      const start = SURAHS.find((s) => s.id === j.surah);
      return { ...j, startName: start?.name ?? "" };
    });
  }, []);

  return (
    <AppShell title="المصحف">
      <main className="px-5 pt-6">
        <p className="font-arabic text-center text-xl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="mt-2 mb-6 text-center text-xs text-muted">
          {QURAN.length} سورة · {AYAH_TOTAL} آية · رواية حفص عن عاصم
        </p>

        {last ? (
          <Link
            to="/quran/$n"
            params={{ n: String(last.id) }}
            className="mb-5 block border border-fg/12 bg-elevated px-4 py-3 tap"
          >
            <span className="block text-xs text-muted">متابعة القراءة</span>
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-arabic text-lg">سورة {last.name}</span>
              <span className="text-sm tabular-nums text-muted">
                آية {lastAyah}
              </span>
            </span>
          </Link>
        ) : null}

        <div className="mb-3 flex border-b border-fg/12">
          <button
            type="button"
            onClick={() => setTab("suwar")}
            className={cn(
              "flex-1 py-2.5 text-sm",
              tab === "suwar"
                ? "border-b border-accent text-accent"
                : "text-muted",
            )}
          >
            السور
          </button>
          <button
            type="button"
            onClick={() => setTab("juz")}
            className={cn(
              "flex-1 py-2.5 text-sm",
              tab === "juz"
                ? "border-b border-accent text-accent"
                : "text-muted",
            )}
          >
            الأجزاء
          </button>
        </div>

        {tab === "suwar" ? (
          <ol>
            {SURAHS.map((s) => (
              <li key={s.id}>
                <Link
                  to="/quran/$n"
                  params={{ n: String(s.id) }}
                  className="tap block"
                >
                  <TocRow
                    n={s.id}
                    title={s.name}
                    meta={`${s.makki ? "مكية" : "مدنية"} · ${s.count}`}
                  />
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <ol>
            {byJuz.map((j) => (
              <li key={j.n}>
                <Link
                  to="/quran/$n"
                  params={{ n: String(j.surah) }}
                  search={{ ayah: j.ayah }}
                  className="tap block"
                >
                  <TocRow
                    n={j.n}
                    title={`الجزء ${j.n}`}
                    meta={`${j.startName} · ${j.ayah}`}
                  />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </AppShell>
  );
}
