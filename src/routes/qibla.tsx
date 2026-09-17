import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout";
import { QiblaCompass } from "@/components/qibla-compass";
import { Button } from "@/components/ui/button";
import {
  CITIES,
  angleDelta,
  cardinalAr,
  distanceKm,
  formatDeg,
  turnHint,
} from "@/lib/qibla";
import { useQibla } from "@/lib/use-qibla";
import { useAppStore } from "@/lib/store";
import { arNum, cn } from "@/lib/utils";

export const Route = createFileRoute("/qibla")({ component: QiblaPage });

function QiblaPage() {
  const fix = useAppStore((s) => s.qibla);
  const setQibla = useAppStore((s) => s.setQibla);
  const { heading, starting, err, start } = useQibla();
  const qibla = fix?.bearing ?? null;
  const delta = heading != null && qibla != null ? angleDelta(heading, qibla) : null;
  const hint = delta != null ? turnHint(delta) : null;
  const km = fix ? distanceKm(fix.lat, fix.lng) : null;
  const nearHaram = km != null && km < 0.4;

  return (
    <AppShell title="القبلة">
      <main className="px-5 pt-6 pb-8">
        <QiblaCompass
          heading={heading}
          qibla={nearHaram ? null : qibla}
          aligned={hint?.aligned ?? false}
        />

        <p className="mt-4 text-center font-arabic text-2xl leading-none">
          {nearHaram
            ? "أنت عند البيت الحرام"
            : hint
              ? hint.text
              : fix
                ? "الكعبة على القرص — وجّه العلامة للأعلى"
                : "شغّل البوصلة أو اختر مدينتك"}
        </p>

        {fix && !nearHaram ? (
          <p className="mt-2 text-center text-sm text-muted">
            {formatDeg(fix.bearing)} من الشمال · {cardinalAr(fix.bearing)}
            {km != null ? ` · ${arNum(Math.round(km))} كم` : ""}
            {fix.label ? ` · ${fix.label}` : ""}
          </p>
        ) : !fix ? (
          <p className="mt-2 text-center text-sm text-muted">
            الحساب على الجهاز من موقعك إلى الكعبة، بلا إنترنت.
          </p>
        ) : null}

        {err ? <p className="mt-3 text-center text-sm text-danger">{err}</p> : null}

        <div className="mt-6">
          <Button className="w-full" onClick={start} disabled={starting}>
            {starting ? "…" : "تشغيل بوصلة الهاتف"}
          </Button>
        </div>

        <h2 className="mt-8 mb-3 text-sm font-semibold">اختر المدينة</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => {
            const on = fix?.label === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setQibla(c.lat, c.lng, c.name)}
                className={cn(
                  "tap h-10 px-3 text-sm",
                  on
                    ? "bg-accent text-accent-fg"
                    : "border border-fg/12 bg-elevated",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
