import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { TocRow } from "@/components/toc-row";
import { BOOKS, SHELVES } from "@/lib/library";

export const Route = createFileRoute("/library/")({ component: LibraryHome });

function LibraryHome() {
  return (
    <AppShell title="المكتبة">
      <main className="px-5 pt-6">
        <p className="mb-8 text-sm text-muted">
          الصحاح الستة والموطأ ورياض الصالحين وبلوغ المرام، ومتون العقيدة والفقه، كاملة بألفاظها.
        </p>
        {SHELVES.map((shelf) => {
          const list = BOOKS.filter((b) => b.shelf === shelf.id);
          return (
            <section key={shelf.id} className="mb-10">
              <Link
                to="/library/$shelf"
                params={{ shelf: shelf.id }}
                className="mb-1 block"
              >
                <h2 className="font-arabic text-xl">{shelf.name}</h2>
                <p className="text-sm text-muted">{shelf.blurb}</p>
              </Link>
              <ul>
                {list.map((b, i) => (
                  <li key={b.id}>
                    <Link
                      to="/book/$id"
                      params={{ id: b.id }}
                      className="tap block"
                    >
                      <TocRow n={i + 1} title={b.title} meta={b.extra} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </AppShell>
  );
}
