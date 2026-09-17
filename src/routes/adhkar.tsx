import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { TocRow } from "@/components/toc-row";
import { CATEGORIES, byCategory } from "@/lib/adhkar";
import { categoryProgress, useAppStore } from "@/lib/store";

export const Route = createFileRoute("/adhkar")({ component: AdhkarIndex });

const EASTERN = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠", "١١", "١٢"];

function AdhkarIndex() {
  const custom = useAppStore((s) => s.custom);
  const progress = useAppStore((s) => s.progress);

  return (
    <AppShell title="الأذكار">
      <main className="px-5 pt-6">
        <p className="mb-4 text-sm text-muted">
          أبواب الأذكار من القرآن والسنة. الألفاظ الأصلية لا تُعدَّل.
        </p>
        <ol>
          {CATEGORIES.map((cat, i) => {
            const list = byCategory(cat.id, custom);
            const p = categoryProgress(list, progress);
            return (
              <li key={cat.id}>
                <Link
                  to="/category/$id"
                  params={{ id: cat.id }}
                  className="tap block"
                >
                  <TocRow
                    n={EASTERN[i] ?? i + 1}
                    title={cat.name}
                    meta={`${p.done}/${p.total}`}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-center text-sm">
          <Link to="/custom" className="text-accent">
            أذكاري
          </Link>
          <span className="mx-2 text-muted">·</span>
          <Link to="/favorites" className="text-accent">
            المفضلة
          </Link>
        </p>
      </main>
    </AppShell>
  );
}
