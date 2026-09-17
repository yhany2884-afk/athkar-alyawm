import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { DhikrCard } from "@/components/dhikr-card";
import { mergeAdhkar } from "@/lib/adhkar";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const custom = useAppStore((s) => s.custom);
  const favorites = useAppStore((s) => s.favorites);
  const progress = useAppStore((s) => s.progress);
  const all = mergeAdhkar(custom);
  const list = favorites
    .map((id) => all.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <AppShell title="المفضلة">
      <main className="px-5 pt-5">
        {list.length === 0 ? (
          <div className="pt-10 text-center">
            <p className="text-sm text-muted">
              لم تُحفَظ أذكار بعد. افتح ذكرًا واختر «حفظ في المفضلة».
            </p>
            <Link to="/adhkar" className="mt-4 inline-block text-sm text-accent">
              تصفّح الأبواب
            </Link>
          </div>
        ) : (
          <ul>
            {list.map((d) => (
              <li key={d.id}>
                <DhikrCard dhikr={d} current={progress[d.id] ?? 0} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
