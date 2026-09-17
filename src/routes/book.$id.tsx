import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout";
import { loadBook, type Book, type Chapter } from "@/lib/library";
import { arNum, parseArNum } from "@/lib/utils";

export const Route = createFileRoute("/book/$id")({ component: BookPage });

const PAGE = 24;

function BookPage() {
  const { id } = Route.useParams();
  const [book, setBook] = useState<Book | null | undefined>(undefined);
  const [open, setOpen] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    let live = true;
    setBook(undefined);
    setOpen(null);
    setPage(0);
    setQ("");
    loadBook(id).then((b) => {
      if (!live) return;
      setBook(b ?? null);
      if (!b) return;
      setOpen(b.chapters[0]?.id ?? null);
    });
    return () => {
      live = false;
    };
  }, [id]);

  const needle = q.trim();
  const chapters = useMemo(() => {
    if (!book) return [];
    if (!needle) return book.chapters;
    const num = parseArNum(needle);
    if (num != null) {
      return book.chapters.filter((ch) => ch.items?.some((h) => h.n === num));
    }
    if (needle.length < 2) return book.chapters;
    return book.chapters
      .map((ch) => {
        const titleHit =
          ch.title.includes(needle) || (ch.body?.includes(needle) ?? false);
        if (titleHit) return ch;
        const items = ch.items?.filter((h) => h.text.includes(needle));
        return { ...ch, items };
      })
      .filter(
        (ch) =>
          ch.title.includes(needle) ||
          (ch.body?.includes(needle) ?? false) ||
          (ch.items && ch.items.length > 0),
      );
  }, [book, needle]);

  useEffect(() => {
    if (!book || !needle) return;
    const num = parseArNum(needle);
    if (num == null) {
      if (chapters.length === 1) setOpen(chapters[0].id);
      return;
    }
    const ch = book.chapters.find((c) => c.items?.some((h) => h.n === num));
    if (!ch) return;
    setOpen(ch.id);
    const idx = (ch.items ?? []).findIndex((h) => h.n === num);
    if (idx >= 0) setPage(Math.floor(idx / PAGE));
  }, [book, needle, chapters]);

  if (book === undefined) {
    return (
      <AppShell title="المكتبة">
        <main className="px-5 pt-8 text-center text-muted">يُفتح الكتاب…</main>
      </AppShell>
    );
  }

  if (!book) {
    return (
      <AppShell title="المكتبة">
        <main className="px-5 pt-8 text-center text-muted">
          الكتاب غير موجود
        </main>
      </AppShell>
    );
  }

  const totalHadith = book.chapters.reduce(
    (n, c) => n + (c.items?.length ?? 0),
    0,
  );
  const many = book.chapters.length > 8;
  const current = chapters.find((c) => c.id === open);

  return (
    <AppShell title={book.title}>
      <main className="px-5 pt-5 pb-8">
        <p className="text-sm text-muted">{book.author}</p>
        <p className="mt-1 text-sm">{book.blurb}</p>
        {totalHadith ? (
          <p className="mt-1 mb-4 text-xs text-muted">
            {totalHadith === book.chapters.length
              ? `${arNum(totalHadith)} حديثًا`
              : `${arNum(totalHadith)} حديثًا · ${arNum(book.chapters.length)} بابًا`}
          </p>
        ) : (
          <p className="mt-1 mb-4 text-xs text-muted">
            {arNum(book.chapters.length)} فصول
          </p>
        )}

        {totalHadith > 40 ? (
          <label className="mb-5 block">
            <span className="sr-only">بحث في الكتاب</span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="رقم الحديث أو كلمة من المتن…"
              className="h-11 w-full border border-fg/12 bg-elevated px-3 text-sm text-fg outline-none placeholder:text-muted"
            />
          </label>
        ) : null}

        {many ? (
          <nav className="mb-6 columns-2 gap-4 text-sm sm:columns-3">
            {chapters.map((ch) => (
              <a
                key={ch.id}
                href={`#c-${ch.id}`}
                className="mb-1 block text-accent"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(ch.id);
                  setPage(0);
                  document.getElementById(`c-${ch.id}`)?.scrollIntoView({
                    block: "start",
                  });
                }}
              >
                {ch.title}
              </a>
            ))}
          </nav>
        ) : null}

        {chapters.map((ch) => {
          const isOpen = open === ch.id;
          const nItems = ch.items?.length ?? 0;
          return (
            <section key={ch.id} id={`c-${ch.id}`} className="rule py-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(isOpen ? null : ch.id);
                  setPage(0);
                }}
                className="flex w-full items-baseline justify-between gap-3 py-1 text-right tap"
              >
                <h2
                  className={isOpen ? "font-medium text-accent" : "font-medium"}
                >
                  {ch.title}
                </h2>
                <span className="shrink-0 text-xs text-muted">
                  {nItems ? arNum(nItems) : isOpen ? "—" : "+"}
                </span>
              </button>
              {isOpen ? <ChapterBody ch={ch} page={page} setPage={setPage} /> : null}
            </section>
          );
        })}

        {current && many ? (
          <ChapterNav
            chapters={chapters}
            currentId={current.id}
            onGo={(cid) => {
              setOpen(cid);
              setPage(0);
              document.getElementById(`c-${cid}`)?.scrollIntoView({
                block: "start",
              });
            }}
          />
        ) : null}

        <p className="mt-8 text-center text-sm">
          <Link
            to="/library/$shelf"
            params={{ shelf: book.shelf }}
            className="text-accent"
          >
            بقية الرف
          </Link>
        </p>
      </main>
    </AppShell>
  );
}

function ChapterBody({
  ch,
  page,
  setPage,
}: {
  ch: Chapter;
  page: number;
  setPage: (n: number | ((p: number) => number)) => void;
}) {
  const items = ch.items ?? [];
  const pages = Math.max(1, Math.ceil(items.length / PAGE));
  const safePage = Math.min(page, pages - 1);
  const slice = items.slice(safePage * PAGE, (safePage + 1) * PAGE);

  return (
    <article className="mt-3">
      {ch.source ? (
        <p className="mb-3 text-xs text-accent">{ch.source}</p>
      ) : null}
      {ch.body
        ? ch.body.split("\n\n").map((p, i) => (
            <p key={`${ch.id}-${i}`} className="font-arabic mb-4 text-lg leading-loose">
              {p}
            </p>
          ))
        : null}
      {slice.map((h, i) => (
        <p key={`${ch.id}-${h.n}-${i}`} className="font-arabic mb-5 text-lg leading-loose">
          <span className="ml-2 text-sm text-accent">{arNum(h.n)}</span>
          {h.text}
        </p>
      ))}
      {pages > 1 ? (
        <div className="mt-2 flex items-center justify-between text-sm">
          <button
            type="button"
            className="min-h-10 px-2 text-accent disabled:text-muted tap"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            السابق
          </button>
          <span className="text-muted">
            {arNum(safePage * PAGE + 1)}–{arNum(Math.min(items.length, (safePage + 1) * PAGE))} من {arNum(items.length)}
          </span>
          <button
            type="button"
            className="min-h-10 px-2 text-accent disabled:text-muted tap"
            disabled={safePage >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </button>
        </div>
      ) : null}
    </article>
  );
}

function ChapterNav({
  chapters,
  currentId,
  onGo,
}: {
  chapters: Chapter[];
  currentId: string;
  onGo: (id: string) => void;
}) {
  const i = chapters.findIndex((c) => c.id === currentId);
  const prev = i > 0 ? chapters[i - 1] : null;
  const next = i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
  if (!prev && !next) return null;
  return (
    <p className="mt-6 flex justify-between gap-4 text-sm">
      {prev ? (
        <button type="button" className="text-accent tap" onClick={() => onGo(prev.id)}>
          {prev.title}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button type="button" className="text-accent tap" onClick={() => onGo(next.id)}>
          {next.title}
        </button>
      ) : null}
    </p>
  );
}
