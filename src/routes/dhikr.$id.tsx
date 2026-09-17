import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { CounterRing } from "@/components/counter-ring";
import { byCategory, byId } from "@/lib/adhkar";
import type { CategoryId } from "@/lib/adhkar/types";
import { CATEGORY_IDS } from "@/lib/adhkar/types";
import { useAppStore } from "@/lib/store";
import { countLabel } from "@/lib/utils";

export const Route = createFileRoute("/dhikr/$id")({
  component: DhikrPage,
  validateSearch: (s: Record<string, unknown>): { from?: string } => ({
    from: typeof s.from === "string" ? s.from : undefined,
  }),
});

function isCategory(id: string): id is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(id);
}

function DhikrPage() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const navigate = useNavigate();
  const custom = useAppStore((s) => s.custom);
  const progress = useAppStore((s) => s.progress);
  const tick = useAppStore((s) => s.tick);
  const resetOne = useAppStore((s) => s.resetOne);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const notes = useAppStore((s) => s.notes);
  const setNote = useAppStore((s) => s.setNote);
  const settings = useAppStore((s) => s.settings);
  const [noteOpen, setNoteOpen] = useState(false);

  const dhikr = byId(id, custom);
  const playlist = useMemo(() => {
    if (from && isCategory(from)) return byCategory(from, custom);
    return [];
  }, [from, custom]);
  const idx = playlist.findIndex((d) => d.id === id);
  const prev = idx > 0 ? playlist[idx - 1] : undefined;
  const next =
    idx >= 0 && idx < playlist.length - 1 ? playlist[idx + 1] : undefined;

  if (!dhikr) {
    return (
      <AppShell title="غير موجود">
        <main className="px-5 pt-8 text-center text-muted">
          هذا الذكر غير موجود.
          <p className="mt-4">
            <Link to="/" className="text-accent">
              العودة
            </Link>
          </p>
        </main>
      </AppShell>
    );
  }

  const current = progress[dhikr.id] ?? 0;
  const done = current >= dhikr.count;
  const fav = favorites.includes(dhikr.id);

  return (
    <AppShell title={dhikr.title}>
      <main className="px-5 pt-5 pb-6">
        <p className="text-center text-xs text-muted">
          {countLabel(dhikr.count)} ·{" "}
          {dhikr.sourceKind === "quran" ? "قرآن" : "سنّة"}
          {dhikr.locked ? " · نص ثابت" : ""}
        </p>

        <article className="folio mt-5 px-5 py-8">
          <p className="dhikr-ar text-center">{dhikr.arabic}</p>
          <p className="mt-5 text-center text-sm text-muted">{dhikr.when}</p>
        </article>

        <div className="mt-8">
          <CounterRing
            current={current}
            max={dhikr.count}
            onTick={() => {
              tick(dhikr.id, dhikr.count);
              const after = useAppStore.getState().progress[dhikr.id] ?? 0;
              if (after >= dhikr.count && next) {
                window.setTimeout(() => {
                  navigate({
                    to: "/dhikr/$id",
                    params: { id: next.id },
                    search: { from },
                  });
                }, 420);
              }
            }}
            onReset={() => resetOne(dhikr.id)}
          />
          {done ? (
            <p className="mt-2 text-center text-sm text-accent">أتممت هذا الذكر</p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => toggleFavorite(dhikr.id)}
            className="text-accent tap"
          >
            {fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
          </button>
          {!dhikr.locked ? (
            <>
              {" · "}
              <Link to="/custom" className="text-accent">
                تعديل ذكري
              </Link>
            </>
          ) : null}
        </p>

        <section className="mt-8 space-y-6">
          <div className="rule pb-5">
            <h2 className="text-sm font-semibold">المصدر</h2>
            <p className="mt-1 text-xs text-accent">{dhikr.sourceRef}</p>
            <p className="mt-2 text-sm leading-relaxed">{dhikr.source}</p>
          </div>

          {settings.showMeaning ? (
            <div className="rule pb-5">
              <h2 className="text-sm font-semibold">المعنى</h2>
              <p className="mt-2 text-sm leading-relaxed">{dhikr.meaning}</p>
            </div>
          ) : null}

          {settings.showFadl && dhikr.fadl ? (
            <div className="rule pb-5">
              <h2 className="text-sm font-semibold">الفضل</h2>
              <p className="mt-2 text-sm leading-relaxed">{dhikr.fadl}</p>
            </div>
          ) : null}

          <div>
            <button
              type="button"
              className="flex w-full items-baseline justify-between text-sm font-semibold"
              onClick={() => setNoteOpen((v) => !v)}
            >
              ملاحظة شخصية
              <span className="text-xs font-normal text-muted">
                لا تمسّ النص الأصلي
              </span>
            </button>
            {noteOpen ? (
              <textarea
                className="mt-3 min-h-24 w-full resize-y border border-fg/12 bg-elevated p-3 text-sm text-fg outline-none"
                placeholder="اكتب تذكيرًا لنفسك…"
                value={notes[dhikr.id] ?? ""}
                onChange={(e) => setNote(dhikr.id, e.target.value)}
              />
            ) : notes[dhikr.id] ? (
              <p className="mt-2 text-sm text-muted">{notes[dhikr.id]}</p>
            ) : null}
          </div>
        </section>

        {playlist.length > 0 ? (
          <div className="mt-8 flex gap-3 text-sm">
            {prev ? (
              <Link
                to="/dhikr/$id"
                params={{ id: prev.id }}
                search={{ from }}
                className="flex h-11 flex-1 items-center justify-center border border-fg/15 tap"
              >
                السابق
              </Link>
            ) : (
              <span className="flex h-11 flex-1 items-center justify-center text-muted">
                —
              </span>
            )}
            {next ? (
              <Link
                to="/dhikr/$id"
                params={{ id: next.id }}
                search={{ from }}
                className="flex h-11 flex-1 items-center justify-center border border-fg/15 tap"
              >
                التالي
              </Link>
            ) : (
              <span className="flex h-11 flex-1 items-center justify-center text-muted">
                —
              </span>
            )}
          </div>
        ) : from && isCategory(from) ? (
          <p className="mt-8 text-center text-sm">
            <Link to="/category/$id" params={{ id: from }} className="text-accent">
              الرجوع للباب
            </Link>
          </p>
        ) : (
          <p className="mt-8 text-center text-sm">
            <Link to="/adhkar" className="text-accent">
              الرجوع للباب
            </Link>
          </p>
        )}
      </main>
    </AppShell>
  );
}
