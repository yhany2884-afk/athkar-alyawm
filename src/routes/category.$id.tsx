import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { DhikrCard } from "@/components/dhikr-card";
import { CATEGORY_MAP, byCategory } from "@/lib/adhkar";
import type { CategoryId } from "@/lib/adhkar/types";
import { CATEGORY_IDS } from "@/lib/adhkar/types";
import { categoryProgress, useAppStore } from "@/lib/store";

export const Route = createFileRoute("/category/$id")({
  component: CategoryPage,
});

function isCategory(id: string): id is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(id);
}

function CategoryPage() {
  const { id } = Route.useParams();
  const custom = useAppStore((s) => s.custom);
  const progress = useAppStore((s) => s.progress);

  if (!isCategory(id)) {
    return (
      <AppShell title="باب غير موجود">
        <main className="px-5 pt-8 text-center text-muted">
          هذا الباب غير معروف.
          <p className="mt-4">
            <Link to="/" className="text-accent">
              العودة
            </Link>
          </p>
        </main>
      </AppShell>
    );
  }

  const cat = CATEGORY_MAP[id];
  const list = byCategory(id, custom);
  const p = categoryProgress(list, progress);

  return (
    <AppShell title={cat.name}>
      <main className="px-5 pt-5">
        <p className="text-sm text-muted">{cat.when}</p>
        <p className="mt-1 mb-4 text-xs tabular-nums text-muted">
          {p.done} من {p.total}
        </p>
        <ul>
          {list.map((d) => (
            <li key={d.id}>
              <DhikrCard dhikr={d} current={progress[d.id] ?? 0} from={id} />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm">
          <Link to="/adhkar" className="text-accent">
            كل الأبواب
          </Link>
        </p>
      </main>
    </AppShell>
  );
}
