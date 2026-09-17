import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  ARABIC_FONTS,
  PATTERNS,
  PRESETS,
  UI_FONTS,
  type ArabicFontId,
  type PatternId,
  type UiFontId,
} from "@/lib/theme";
import { useAppStore } from "@/lib/store";
import { BUILTIN_WALLPAPERS } from "@/lib/wallpapers";
import {
  compressImage,
  deleteCustomImage,
  loadCustomImage,
  saveCustomImage,
} from "@/lib/wallpaper-idb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-fg/10 py-3">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-xs tabular-nums text-muted">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 overflow-hidden border border-fg/15"
          aria-label={label}
        />
      </span>
    </label>
  );
}

function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const applyPreset = useAppStore((s) => s.applyPreset);
  const patch = useAppStore((s) => s.patchSettings);
  const resetAll = useAppStore((s) => s.resetAllProgress);
  const customCount = useAppStore((s) => s.custom.length);
  const papers = useAppStore((s) => s.papers) ?? [];
  const addPaper = useAppStore((s) => s.addPaper);
  const removePaper = useAppStore((s) => s.removePaper);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function onPick(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (papers.length >= 8) {
      setUploadErr("أقصى ثماني صور من الجهاز.");
      return;
    }
    setUploading(true);
    setUploadErr(null);
    try {
      const blob = await compressImage(file);
      const id = `${Date.now().toString(36)}`;
      await saveCustomImage(id, blob);
      addPaper({ id, name: file.name.replace(/\.[^.]+$/, "") || "صورة" });
      patch({ wallpaperId: `c:${id}` });
    } catch {
      setUploadErr("تعذّر ضغط الصورة. جرّب صورة أصغر.");
    } finally {
      setUploading(false);
    }
  }

  async function dropPaper(id: string) {
    await deleteCustomImage(id).catch(() => undefined);
    removePaper(id);
  }

  return (
    <AppShell title="التخصيص">
      <main className="space-y-8 px-5 pt-5 pb-8">
        <section className="folio px-5 py-6">
          <p className="dhikr-ar text-center">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="mt-3 text-center text-xs text-muted">
            معاينة الخط واللون — النص الأصلي لا يتغيّر
          </p>
        </section>

        <section>
          <p className="text-sm leading-relaxed text-muted">
            الأذكار المأخوذة من القرآن والسنة{" "}
            <strong className="text-fg">ثابتة</strong> لا تُعدَّل ألفاظها ولا مصادرها.
            يمكنك تخصيص الألوان والخلفية ونمط الخط، وإضافة أذكار شخصية.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">طابع جاهز</h2>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "tap flex flex-col items-center gap-2 p-2",
                  settings.preset === p.id
                    ? "shadow-[0_0_0_1px_var(--color-accent)]"
                    : "hairline",
                )}
              >
                <span
                  className="size-10"
                  style={{ background: p.bg, boxShadow: `inset 0 0 0 6px ${p.accent}` }}
                />
                <span className="text-xs">{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold">خلفيات إسلامية</h2>
          <p className="mb-3 text-xs text-muted">
            صور الأماكن المقدسة داخل التطبيق، أو صورة من هاتفك. لكل صورة لون وسطوع وتباين.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {BUILTIN_WALLPAPERS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => patch({ wallpaperId: w.id })}
                className={cn(
                  "tap overflow-hidden text-right",
                  settings.wallpaperId === w.id
                    ? "shadow-[0_0_0_1px_var(--color-accent)]"
                    : "hairline",
                )}
              >
                {w.src ? (
                  <img src={w.src} alt="" className="wp-thumb" />
                ) : (
                  <span className="wp-thumb bg-surface" />
                )}
                <span className="block px-1.5 py-1.5 text-xs leading-tight">
                  {w.name}
                </span>
              </button>
            ))}
            {papers.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "relative overflow-hidden",
                  settings.wallpaperId === `c:${p.id}`
                    ? "shadow-[0_0_0_1px_var(--color-accent)]"
                    : "hairline",
                )}
              >
                <button
                  type="button"
                  className="tap w-full text-right"
                  onClick={() => patch({ wallpaperId: `c:${p.id}` })}
                >
                  <CustomThumb id={p.id} />
                  <span className="block truncate px-1.5 py-1.5 text-xs">
                    {p.name}
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute start-1 top-1 bg-bg/90 px-1.5 text-xs tap"
                  onClick={() => dropPaper(p.id)}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void onPick(f);
            }}
          />
          <Button
            variant="outline"
            className="mt-3 w-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "تُضغط الصورة…" : "إضافة صورة من الهاتف"}
          </Button>
          {uploadErr ? (
            <p className="mt-2 text-xs text-danger">{uploadErr}</p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              تُضغط الصورة تلقائيًا وتُحفظ على الجهاز فقط — لتسريع الهاتف.
            </p>
          )}

          {settings.wallpaperId !== "none" ? (
            <div className="mt-4 space-y-3">
              <ColorField
                label="لون الصورة"
                value={settings.wallpaperTint}
                onChange={(wallpaperTint) => patch({ wallpaperTint })}
              />
              <Range
                label="كثافة اللون"
                value={settings.wallpaperTintStrength}
                min={0}
                max={60}
                onChange={(wallpaperTintStrength) =>
                  patch({ wallpaperTintStrength })
                }
              />
              <Range
                label="السطوع"
                value={settings.wallpaperBrightness}
                min={40}
                max={160}
                onChange={(wallpaperBrightness) =>
                  patch({ wallpaperBrightness })
                }
              />
              <Range
                label="التباين"
                value={settings.wallpaperContrast}
                min={40}
                max={160}
                onChange={(wallpaperContrast) => patch({ wallpaperContrast })}
              />
              <Range
                label="وضوح النص فوق الصورة"
                value={settings.wallpaperVeil}
                min={35}
                max={92}
                onChange={(wallpaperVeil) => patch({ wallpaperVeil })}
              />
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold">الزجاج السائل</h2>
          <p className="mb-3 text-xs text-muted">
            شريط سفلي كزجاج iOS: عائم، ضبابي، ولامع. عطّله إن رغبت بشريط ثابت.
          </p>
          <Toggle
            label="زجاج سائل"
            checked={settings.liquidGlass !== false}
            onChange={(liquidGlass) => patch({ liquidGlass })}
            on="تشغيل"
            off="إيقاف"
          />
          <Toggle
            label="شريط عائم"
            checked={(settings.navStyle ?? "float") === "float"}
            onChange={(on) => patch({ navStyle: on ? "float" : "dock" })}
            on="عائم"
            off="ملتصق"
          />
          <label className="mt-4 block">
            <span className="mb-2 flex justify-between text-sm">
              <span>تفتيح</span>
              <span className="text-muted">
                {(settings.navDim ?? 26) < 28
                  ? "فاتح"
                  : (settings.navDim ?? 26) > 72
                    ? "غامق"
                    : "متوازن"}
              </span>
              <span>تعتيم</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.navDim ?? 26}
              onChange={(e) => patch({ navDim: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)]"
            />
          </label>
          <Range
            label="الضبابية"
            value={settings.navBlur ?? 64}
            min={10}
            max={100}
            onChange={(navBlur) => patch({ navBlur })}
          />
          <Range
            label="اللمعان"
            value={settings.navSpecular ?? 58}
            min={0}
            max={100}
            onChange={(navSpecular) => patch({ navSpecular })}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">الألوان</h2>
          <ColorField
            label="الخلفية"
            value={settings.bg}
            onChange={(bg) => patch({ bg })}
          />
          <ColorField
            label="السطح"
            value={settings.surface}
            onChange={(surface) => patch({ surface })}
          />
          <ColorField
            label="المرتفع"
            value={settings.elevated}
            onChange={(elevated) => patch({ elevated })}
          />
          <ColorField
            label="النص"
            value={settings.fg}
            onChange={(fg) => patch({ fg })}
          />
          <ColorField
            label="النص الخافت"
            value={settings.muted}
            onChange={(muted) => patch({ muted })}
          />
          <ColorField
            label="اللون المميز"
            value={settings.accent}
            onChange={(accent) => patch({ accent })}
          />
          <ColorField
            label="نص الزر"
            value={settings.accentFg}
            onChange={(accentFg) => patch({ accentFg })}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">نمط الخلفية</h2>
          <div className="grid grid-cols-3 gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => patch({ pattern: p.id as PatternId })}
                className={cn(
                  "tap h-11 text-sm",
                  settings.pattern === p.id
                    ? "bg-accent text-accent-fg"
                    : "border border-fg/12 bg-elevated",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="mb-2 flex justify-between text-sm">
              كثافة النقش
              <span className="tabular-nums text-muted">
                {settings.patternStrength}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={40}
              value={settings.patternStrength}
              onChange={(e) =>
                patch({ patternStrength: Number(e.target.value) })
              }
              className="w-full accent-[var(--color-accent)]"
            />
          </label>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">خط الأذكار</h2>
          <div className="grid grid-cols-2 gap-2">
            {ARABIC_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => patch({ arabicFont: f.id as ArabicFontId })}
                className={cn(
                  "tap px-3 py-3 text-right",
                  settings.arabicFont === f.id
                    ? "bg-accent text-accent-fg"
                    : "border border-fg/12 bg-elevated",
                )}
              >
                <span className="block text-xs opacity-80">{f.name}</span>
                <span className="mt-1 block text-lg" style={{ fontFamily: f.stack }}>
                  الحمد لله
                </span>
              </button>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="mb-2 flex justify-between text-sm">
              حجم النص
              <span className="tabular-nums text-muted">{settings.dhikrSize}</span>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              value={settings.dhikrSize}
              onChange={(e) => patch({ dhikrSize: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)]"
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-2 flex justify-between text-sm">
              تباعد الأسطر
              <span className="tabular-nums text-muted">
                {settings.lineHeight.toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={1.6}
              max={2.6}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)]"
            />
          </label>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">خط الواجهة</h2>
          <div className="flex gap-2">
            {UI_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => patch({ uiFont: f.id as UiFontId })}
                className={cn(
                  "tap h-11 flex-1 text-sm",
                  settings.uiFont === f.id
                    ? "bg-accent text-accent-fg"
                    : "border border-fg/12 bg-elevated",
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="mb-3 text-sm font-semibold">العرض</h2>
          <Toggle
            label="إظهار المعنى"
            checked={settings.showMeaning}
            onChange={(showMeaning) => patch({ showMeaning })}
          />
          <Toggle
            label="إظهار الفضل"
            checked={settings.showFadl}
            onChange={(showFadl) => patch({ showFadl })}
          />
          <Toggle
            label="اهتزاز عند العدّ"
            checked={settings.vibrate}
            onChange={(vibrate) => patch({ vibrate })}
          />
          <Toggle
            label="تسريع الهاتف (وضع خفيف)"
            checked={settings.liteMode}
            onChange={(liteMode) => patch({ liteMode })}
            on="تشغيل"
            off="إيقاف"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">البيانات</h2>
          <p className="text-xs text-muted">
            الأذكار الأصلية محفوظة في التطبيق ولا تُمس. عدّاد اليوم والمفضلة والملاحظات
            وأذكارك الشخصية وصورك تُحفظ على هذا الجهاز فقط.
            {customCount ? ` لديك ${customCount} ذكرًا شخصيًا.` : ""}
          </p>
          <Button variant="outline" className="w-full" onClick={() => resetAll()}>
            تصفير عدّاد اليوم والسلسلة
          </Button>
        </section>
      </main>
    </AppShell>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  on = "ظاهر",
  off = "مخفي",
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  on?: string;
  off?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between border-b border-fg/10 py-3 text-sm"
    >
      {label}
      <span className="text-xs text-accent">{checked ? on : off}</span>
    </button>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm">
        {label}
        <span className="tabular-nums text-muted">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
    </label>
  );
}

function CustomThumb({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let url: string | null = null;
    let live = true;
    loadCustomImage(id).then((u) => {
      if (!live) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      url = u;
      setSrc(u);
    });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  if (!src) return <span className="wp-thumb bg-surface" />;
  return <img src={src} alt="" className="wp-thumb" />;
}
