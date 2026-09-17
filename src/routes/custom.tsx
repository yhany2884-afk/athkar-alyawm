import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { DhikrCard } from "@/components/dhikr-card";
import { CATEGORIES } from "@/lib/adhkar";
import type { CategoryId, UserDhikr } from "@/lib/adhkar/types";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/custom")({ component: CustomPage });

const empty = {
  title: "",
  arabic: "",
  count: 1,
  when: "",
  source: "",
  meaning: "",
  categories: ["istighfar"] as CategoryId[],
};

function CustomPage() {
  const custom = useAppStore((s) => s.custom);
  const progress = useAppStore((s) => s.progress);
  const addCustom = useAppStore((s) => s.addCustom);
  const updateCustom = useAppStore((s) => s.updateCustom);
  const removeCustom = useAppStore((s) => s.removeCustom);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(empty);

  function openNew() {
    setForm(empty);
    setEditing("new");
  }
  function openEdit(d: UserDhikr) {
    setForm({
      title: d.title,
      arabic: d.arabic,
      count: d.count,
      when: d.when,
      source: d.source,
      meaning: d.meaning,
      categories: d.categories,
    });
    setEditing(d.id);
  }
  function save() {
    if (!form.title.trim() || !form.arabic.trim()) return;
    if (editing === "new") {
      addCustom(form);
    } else if (editing) {
      updateCustom(editing, form);
    }
    setEditing(null);
  }

  return (
    <AppShell title="أذكاري">
      <main className="px-5 pt-5 pb-8">
        <p className="mb-4 text-sm text-muted">
          أضف أذكارًا شخصية. الأذكار الأصلية من القرآن والسنة تبقى كما وردت ولا تُفتح
          للتعديل.
        </p>
        <Button className="mb-5 w-full" onClick={openNew}>
          إضافة ذكر شخصي
        </Button>

        {editing ? (
          <form
            className="mb-6 space-y-3 border border-fg/12 bg-elevated p-4"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <Field
              label="العنوان"
              value={form.title}
              onChange={(title) => setForm({ ...form, title })}
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">النص</span>
              <textarea
                required
                rows={4}
                value={form.arabic}
                onChange={(e) => setForm({ ...form, arabic: e.target.value })}
                className="w-full border border-fg/12 bg-bg p-3 text-base outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">عدد المرّات</span>
              <input
                type="number"
                min={1}
                max={1000}
                value={form.count}
                onChange={(e) =>
                  setForm({ ...form, count: Number(e.target.value) || 1 })
                }
                className="h-11 w-full border border-fg/12 bg-bg px-3 outline-none"
              />
            </label>
            <Field
              label="الوقت"
              value={form.when}
              onChange={(when) => setForm({ ...form, when })}
            />
            <Field
              label="المصدر (اختياري)"
              value={form.source}
              onChange={(source) => setForm({ ...form, source })}
            />
            <Field
              label="المعنى (اختياري)"
              value={form.meaning}
              onChange={(meaning) => setForm({ ...form, meaning })}
            />
            <fieldset>
              <legend className="mb-2 text-sm text-muted">الباب</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = form.categories.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          categories: on
                            ? form.categories.filter((x) => x !== c.id)
                            : [...form.categories, c.id],
                        })
                      }
                      className={
                        on
                          ? "h-9 bg-accent px-3 text-xs text-accent-fg"
                          : "h-9 border border-fg/12 bg-bg px-3 text-xs"
                      }
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                حفظ
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditing(null)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        ) : null}

        {custom.length === 0 && !editing ? (
          <p className="text-center text-sm text-muted">
            لا أذكار شخصية بعد.{" "}
            <Link to="/adhkar" className="text-accent">
              عُد للأبواب الأصلية
            </Link>
          </p>
        ) : (
          <ul>
            {custom.map((d) => (
              <li key={d.id} className="space-y-2">
                <DhikrCard
                  dhikr={{
                    ...d,
                    sourceKind: "hadith",
                    sourceRef: "إضافة شخصية",
                    source: d.source || "ذكر شخصي",
                    locked: false,
                  }}
                  current={progress[d.id] ?? 0}
                />
                <div className="flex gap-3 pb-3 text-sm">
                  <button
                    type="button"
                    className="text-accent"
                    onClick={() => openEdit(d)}
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    className="text-danger"
                    onClick={() => {
                      if (confirm("حذف هذا الذكر الشخصي؟")) removeCustom(d.id);
                    }}
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border border-fg/12 bg-bg px-3 outline-none"
      />
    </label>
  );
}
