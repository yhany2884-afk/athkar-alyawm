import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout";
import { loadSurah, stripLeadingBasmala } from "@/lib/quran/load";
import { SURAHS } from "@/lib/quran/meta";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/quran/$n")({
  component: SurahPage,
  validateSearch: (s: Record<string, unknown>): { ayah?: number } => ({
    ayah: typeof s.ayah === "number" ? s.ayah : Number(s.ayah) || undefined,
  }),
});

function SurahPage() {
  const { n } = Route.useParams();
  const { ayah: jump } = Route.useSearch();
  const id = Number(n);
  const meta = SURAHS.find((s) => s.id === id);
  const surah = loadSurah(id);
  const setCursor = useAppStore((s) => s.setQuranCursor);

  useEffect(() => {
    if (!surah) return;
    setCursor(surah.id, jump && jump > 0 ? jump : 1);
  }, [surah, jump, setCursor]);

  useEffect(() => {
    if (!jump || !surah) return;
    const el = document.getElementById(`a-${jump}`);
    el?.scrollIntoView({ block: "center" });
  }, [jump, surah]);

  const prev = SURAHS.find((s) => s.id === id - 1);
  const next = SURAHS.find((s) => s.id === id + 1);

  if (!meta || !surah) {
    return (
      <AppShell title="المصحف">
        <main className="px-5 pt-8 text-center text-muted">سورة غير موجودة</main>
      </AppShell>
    );
  }

  const heading = `متابعة سورة ${meta.name}`;

  return (
    <AppShell title={heading}>
      <main className="px-4 pt-4 pb-8">
        <article className="folio px-4 py-6 sm:px-6">
          <p className="text-center text-lg font-semibold">{heading}</p>
          <p className="mt-1 mb-5 text-center text-xs text-muted">
            {meta.makki ? "مكية" : "مدنية"} · {surah.verses.length} آية محفوظة على الجهاز
          </p>
          {id !== 1 && id !== 9 ? (
            <p className="font-arabic mb-6 text-center text-xl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          ) : null}

          <div className="mushaf-ayah text-justify">
            {surah.verses.map((text, i) => {
              const num = i + 1;
              const raw = text ?? "";
              const shown =
                id !== 1 && id !== 9 && num === 1
                  ? stripLeadingBasmala(raw)
                  : raw;
              const line = (shown || raw).trim() ? (shown || raw) : raw;
              return (
                <p
                  key={num}
                  id={`a-${num}`}
                  className="ayah-line"
                  onClick={() => setCursor(id, num)}
                >
                  {line}
                  <span className="ayah-num">{`﴿${num}﴾`}</span>
                </p>
              );
            })}
          </div>
        </article>

        <div className="mt-8 flex gap-3">
          {prev ? (
            <Link
              to="/quran/$n"
              params={{ n: String(prev.id) }}
              className="flex h-11 flex-1 items-center justify-center border border-fg/15 text-sm tap"
            >
              {prev.name}
            </Link>
          ) : (
            <span className="flex h-11 flex-1 items-center justify-center text-sm text-muted">
              الأولى
            </span>
          )}
          {next ? (
            <Link
              to="/quran/$n"
              params={{ n: String(next.id) }}
              className="flex h-11 flex-1 items-center justify-center border border-fg/15 text-sm tap"
            >
              {next.name}
            </Link>
          ) : (
            <span className="flex h-11 flex-1 items-center justify-center text-sm text-muted">
              الأخيرة
            </span>
          )}
        </div>
      </main>
    </AppShell>
  );
}
