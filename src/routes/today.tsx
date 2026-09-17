import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { DhikrCard } from "@/components/dhikr-card";
import { byCategory, CATEGORY_MAP } from "@/lib/adhkar";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/today")({ component: TodayPage });

function TodayPage() {
  const custom = useAppStore((s) => s.custom);
  const progress = useAppStore((s) => s.progress);
  const morning = byCategory("morning", custom);
  const evening = byCategory("evening", custom);

  return (
    <AppShell title="أذكار الصباح والمساء">
      <main className="px-5 pt-5 pb-8">
        <p className="mb-6 text-sm text-muted">
          ما ثبت صباحًا ومساءً من القرآن والسنة. الصيغة الخاصة بالصباح أو بالمساء
          في بابها.
        </p>

        <section className="mb-10">
          <h2 className="font-arabic text-xl">أذكار الصباح</h2>
          <p className="mt-1 mb-3 text-sm text-muted">
            {CATEGORY_MAP.morning.when}
          </p>
          <ul>
            {morning.map((d) => (
              <li key={`m-${d.id}`}>
                <DhikrCard dhikr={d} current={progress[d.id] ?? 0} from="morning" />
              </li>
            ))}
          </ul>
        </section>

        <div className="ornament mb-10" />

        <section>
          <h2 className="font-arabic text-xl">أذكار المساء</h2>
          <p className="mt-1 mb-3 text-sm text-muted">
            {CATEGORY_MAP.evening.when}
          </p>
          <ul>
            {evening.map((d) => (
              <li key={`e-${d.id}`}>
                <DhikrCard dhikr={d} current={progress[d.id] ?? 0} from="evening" />
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-center text-sm">
          <Link to="/adhkar" className="text-accent">
            كل الأبواب
          </Link>
        </p>
      </main>
    </AppShell>
  );
}
