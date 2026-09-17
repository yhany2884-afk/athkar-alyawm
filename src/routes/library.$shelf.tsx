import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { TocRow } from "@/components/toc-row";
import { SHELVES, booksOn } from "@/lib/library";
import type { ShelfId } from "@/lib/library/types";

export const Route = createFileRoute("/library/$shelf")({
  component: ShelfPage,
});

function ShelfPage() {
  const { shelf } = Route.useParams();
  const meta = SHELVES.find((s) => s.id === shelf);
  if (!meta) {
    return (
      <AppShell title="المكتبة">
        <main className="px-5 pt-8 text-center text-muted">رف غير معروف</main>
      </AppShell>
    );
  }
  const list = booksOn(shelf as ShelfId);

  return (
    <AppShell title={meta.name}>
      <main className="px-5 pt-5">
        <p className="mb-4 text-sm text-muted">{meta.blurb}</p>
        <ul>
          {list.map((b, i) => (
            <li key={b.id}>
              <Link to="/book/$id" params={{ id: b.id }} className="tap block">
                <TocRow n={i + 1} title={b.title} meta={b.extra} />
              </Link>
              <p className="pb-3 text-sm text-fg/75">
                {b.author} · {b.blurb}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </AppShell>
  );
}
