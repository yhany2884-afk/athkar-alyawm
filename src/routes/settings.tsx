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
import { PRAYER_METHODS, type PrayerMethod } from "@/lib/prayer";
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
  const [paint, setPaint] = useState<"accent" | "mark" | "bg">("accent");

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
          <div className="grid grid-cols-3 gap-2">
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
          <h2 className="mb-3 text-sm font-semibold">مواقيت الصلاة</h2>
          <p className="mb-3 text-xs text-muted">
            الحساب على الجهاز من موقع القبلة المحفوظ، بلا اتصال.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRAYER_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => patch({ prayerMethod: m.id as PrayerMethod })}
                className={cn(
                  "tap h-11 text-sm",
                  (settings.prayerMethod ?? "egypt") === m.id
                    ? "bg-accent text-accent-fg"
                    : "border border-fg/12 bg-elevated",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="mb-2 flex justify-between text-sm">
              استدارة البطاقات
              <span className="tabular-nums text-muted">{settings.cardRound ?? 24}</span>
            </span>
            <input
              type="range"
              min={12}
              max={32}
              value={settings.cardRound ?? 24}
              onChange={(e) => patch({ cardRound: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)]"
            />
          </label>
          <h3 className="mb-2 mt-5 text-sm font-semibold">صيغة الساعة</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => patch({ clockStyle: "ampm" })}
              className={cn(
                "tap h-11 text-sm",
                (settings.clockStyle ?? "ampm") === "ampm"
                  ? "bg-accent text-accent-fg"
                  : "border border-fg/12 bg-elevated",
              )}
            >
              5:26 AM
            </button>
            <button
              type="button"
              onClick={() => patch({ clockStyle: "ar" })}
              className={cn(
                "tap h-11 text-sm",
                settings.clockStyle === "ar"
                  ? "bg-accent text-accent-fg"
                  : "border border-fg/12 bg-elevated",
              )}
            >
              ٥:٢٦ ص
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold">بطاقات الرئيسية</h2>
          <p className="mb-3 text-xs text-muted">
            أخفِ ما لا تحتاجه. بطاقة الصلاة تبقى، وباقي البطاقات اختيارك.
          </p>
          <Toggle
            label="سماء ليلية في بطاقة الصلاة"
            checked={settings.prayerSky !== false}
            onChange={(prayerSky) => patch({ prayerSky })}
            on="ظاهرة"
            off="لون سادة"
          />
          <Toggle
            label="بطاقة الأذكار"
            checked={settings.homeAdhkar !== false}
            onChange={(homeAdhkar) => patch({ homeAdhkar })}
          />
          <Toggle
            label="بطاقة التقدم"
            checked={settings.homeProgress !== false}
            onChange={(homeProgress) => patch({ homeProgress })}
          />
          <Toggle
            label="بطاقة متابعة السورة"
            checked={settings.homeContinue !== false}
            onChange={(homeContinue) => patch({ homeContinue })}
          />
          <div className="mt-3">
            <ColorField
              label="لون اسم التطبيق"
              value={settings.mark || "#1F6B4A"}
              onChange={(mark) => patch({ mark })}
            />
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
          <div className="mt-4">
            <Range
              label="سرعة الحركة"
              value={settings.animSpeed ?? 3}
              min={1}
              max={5}
              onChange={(animSpeed) => patch({ animSpeed })}
            />
            <p className="mt-1 text-xs text-muted">
              {(settings.animSpeed ?? 3) <= 2
                ? "هادئة"
                : (settings.animSpeed ?? 3) >= 4
                  ? "سريعة"
                  : "متوسطة"}
              {" — "}تشمل فتح التطبيق والانتقال وضغطة الشريط
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">الألوان</h2>
          <div className="mb-3 flex gap-2">
            {(
              [
                ["accent", "المميز"],
                ["mark", "الاسم"],
                ["bg", "الخلفية"],
              ] as const
            ).map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPaint(id)}
                className={cn(
                  "tap h-10 flex-1 text-sm",
                  paint === id ? "bg-accent text-accent-fg" : "border border-fg/12 bg-elevated",
                )}
              >
                {name}
              </button>
            ))}
          </div>
          <ColorWheel
            value={settings[paint]}
            onChange={(hex) => patch({ [paint]: hex })}
          />
          <div className="mt-4 grid grid-cols-6 gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => patch({ [paint]: c })}
                className="tap aspect-square rounded-full"
                style={{
                  background: c,
                  boxShadow:
                    settings[paint].toLowerCase() === c.toLowerCase()
                      ? "0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent)"
                      : "inset 0 0 0 1px color-mix(in oklab, #000 12%, transparent)",
                }}
              />
            ))}
          </div>
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
            المصحف كامل (٦٢٣٦ آية) وخطه محفوظان داخل التطبيق، ويُفتحان بلا إنترنت.
            الأذكار الأصلية لا تُمس. عدّاد اليوم والمفضلة والملاحظات
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

function hexToHsv(hex: string) {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.slice(0, 2), 16) / 255;
  const g = Number.parseInt(h.slice(2, 4), 16) / 255;
  const b = Number.parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToHex(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const SWATCHES = [
  "#163A5F",
  "#1F6B4A",
  "#8C6239",
  "#8E4B5B",
  "#0E7490",
  "#5C6B3A",
  "#6B4C9A",
  "#B45309",
  "#9F1239",
  "#155E75",
  "#3F6212",
  "#1C1917",
];

function ColorWheel({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const ring = useRef<HTMLDivElement>(null);
  const hsv = hexToHsv(/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#163A5F");

  function pick(clientX: number, clientY: number) {
    const el = ring.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = clientX - box.left - box.width / 2;
    const y = clientY - box.top - box.height / 2;
    let deg = (Math.atan2(x, -y) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    onChange(hsvToHex(deg, Math.max(hsv.s, 0.62), Math.max(hsv.v, 0.42)));
  }

  return (
    <div>
      <div
        ref={ring}
        className="hue-ring"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          pick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 0) return;
          pick(e.clientX, e.clientY);
        }}
      >
        <span
          className="hue-knob"
          style={{
            left: `${50 + 38 * Math.sin((hsv.h * Math.PI) / 180)}%`,
            top: `${50 - 38 * Math.cos((hsv.h * Math.PI) / 180)}%`,
            background: hsvToHex(hsv.h, 1, 1),
          }}
        />
        <span className="hue-core" style={{ background: value }} />
      </div>
      <label className="mt-4 block">
        <span className="mb-1 flex justify-between text-xs text-muted">
          التشبع
          <span>{Math.round(hsv.s * 100)}</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(hsv.s * 100)}
          onChange={(e) => onChange(hsvToHex(hsv.h, Number(e.target.value) / 100, hsv.v))}
          className="w-full accent-[var(--color-accent)]"
        />
      </label>
      <label className="mt-2 block">
        <span className="mb-1 flex justify-between text-xs text-muted">
          السطوع
          <span>{Math.round(hsv.v * 100)}</span>
        </span>
        <input
          type="range"
          min={8}
          max={100}
          value={Math.round(hsv.v * 100)}
          onChange={(e) => onChange(hsvToHex(hsv.h, hsv.s, Number(e.target.value) / 100))}
          className="w-full accent-[var(--color-accent)]"
        />
      </label>
    </div>
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
