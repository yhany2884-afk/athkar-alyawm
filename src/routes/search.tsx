import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { DhikrCard } from "@/components/dhikr-card";
import { searchAdhkar } from "@/lib/adhkar";
import { searchBooks } from "@/lib/library";
import { searchQuran } from "@/lib/quran/load";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({ component: SearchPage });

type Tab = "adhkar" | "quran" | "books";

function SearchPage() {
  const custom = useAppStore((s) => s.custom);
  const progress = useAppStore((s) => s.progress);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("adhkar");
  const adhkar = useMemo(() => searchAdhkar(q, custom), [q, custom]);
  const books = useMemo(() => searchBooks(q), [q]);
  const ayahs = useMemo(
    () => (tab === "quran" ? searchQuran(q) : []),
    [q, tab],
  );

  return (
    <AppShell title="بحث">
      <main className="px-5 pt-4">
        <label className="block">
          <span className="sr-only">بحث</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="آية، ذكر، أو كتاب…"
            autoFocus
            className="h-12 w-full border border-fg/12 bg-elevated px-4 text-sm text-fg outline-none placeholder:text-muted"
          />
        </label>
        <div className="mt-4 flex border-b border-fg/12">
          {(
            [
              ["adhkar", "أذكار"],
              ["quran", "قرآن"],
              ["books", "كتب"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 py-2.5 text-sm",
                tab === id
                  ? "border-b border-accent text-accent"
                  : "text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "adhkar" ? (
          <ul className="mt-2">
            {adhkar.map((d) => (
              <li key={d.id}>
                <DhikrCard dhikr={d} current={progress[d.id] ?? 0} />
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "quran" ? (
          <ul className="mt-2">
            {ayahs.map((a) => (
              <li key={`${a.surah}-${a.ayah}`}>
                <Link
                  to="/quran/$n"
                  params={{ n: String(a.surah) }}
                  search={{ ayah: a.ayah }}
                  className="rule block py-3 tap"
                >
                  <span className="text-xs text-accent">
                    {a.name} · {a.ayah}
                  </span>
                  <p className="font-arabic mt-1 line-clamp-2 text-lg leading-relaxed">
                    {a.text}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "books" ? (
          <ul className="mt-2">
            {books.map((h, i) => (
              <li key={`${h.book.id}-${h.chapterTitle}-${i}`}>
                <Link
                  to="/book/$id"
                  params={{ id: h.book.id }}
                  className="rule block py-3 tap"
                >
                  <span className="text-xs text-accent">
                    {h.book.title} · {h.chapterTitle}
                  </span>
                  <p className="mt-1 line-clamp-2 text-sm text-fg/80">
                    {h.snippet}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </AppShell>
  );
}
