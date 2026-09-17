import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { TocRow } from "@/components/toc-row";
import { BOOKS, SHELVES } from "@/lib/library";
import { SURAHS } from "@/lib/quran/meta";
import { useAppStore } from "@/lib/store";
import { gregorianLabel, hijriLabel, arNum } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const lastSurah = useAppStore((s) => s.lastSurah);
  const lastMeta = SURAHS.find((s) => s.id === lastSurah);

  return (
    <AppShell title="أذكار اليوم">
      <main className="px-5 pt-10 pb-6">
        <p className="font-arabic text-center text-2xl leading-loose">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <div className="ornament mt-5 mb-6" />
        <p className="text-center font-arabic text-3xl">أذكار اليوم</p>
        <p className="mt-3 text-center text-sm text-muted">{hijriLabel()}</p>
        <p className="mt-0.5 text-center text-xs text-muted">
          {gregorianLabel()}
        </p>

        <h2 className="mt-12 mb-1 font-arabic text-lg">المحتويات</h2>
        <p className="mb-1 text-xs text-muted">مصحف · أذكار · متون</p>

        <nav>
          <Link to="/quran" className="tap block">
            <TocRow
              n="١"
              title="المصحف الشريف"
              meta={
                lastMeta
                  ? `متابعة: ${lastMeta.name}`
                  : "١١٤ سورة · حفص"
              }
            />
          </Link>
          <Link to="/today" className="tap block">
            <TocRow
              n="٢"
              title="أذكار الصباح والمساء"
              meta="حصن اليوم من الفجر إلى العشاء"
            />
          </Link>
          <Link to="/adhkar" className="tap block">
            <TocRow
              n="٣"
              title="الأذكار المأثورة"
              meta="صلاة ونوم وسائر اليوم"
            />
          </Link>
          {SHELVES.map((s, i) => (
            <Link
              key={s.id}
              to="/library/$shelf"
              params={{ shelf: s.id }}
              className="tap block"
            >
              <TocRow
                n={["٤", "٥", "٦"][i] ?? String(i + 4)}
                title={s.name}
                meta={`${arNum(BOOKS.filter((b) => b.shelf === s.id).length)} كتب`}
              />
            </Link>
          ))}
        </nav>
      </main>
    </AppShell>
  );
}
