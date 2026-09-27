import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout";
import { QiblaCompass } from "@/components/qibla-compass";
import { Button } from "@/components/ui/button";
import { angleDelta, cardinalAr, distanceKm, formatDeg, turnHint } from "@/lib/qibla";
import { useQibla } from "@/lib/use-qibla";
import { useAppStore } from "@/lib/store";
import { arNum } from "@/lib/utils";

export const Route = createFileRoute("/qibla")({ component: QiblaPage });

function QiblaPage() {
  const fix = useAppStore((s) => s.qibla);
  const { heading, starting, err, start } = useQibla();
  const qibla = fix?.bearing ?? null;
  const delta = heading != null && qibla != null ? angleDelta(heading, qibla) : null;
  const hint = delta != null ? turnHint(delta) : null;
  const km = fix ? distanceKm(fix.lat, fix.lng) : null;
  const nearHaram = km != null && km < 0.4;

  useEffect(() => {
    start();
  }, [start]);

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
                ? "الكعبة على القرص — وجّه أعلى الهاتف نحوها"
                : starting
                  ? "يُحدَّد موقعك من الهاتف…"
                  : "اسمح بالموقع ليُحسب الاتجاه إلى الكعبة"}
        </p>

        {fix && !nearHaram ? (
          <p className="mt-2 text-center text-sm text-muted">
            {formatDeg(fix.bearing)} من الشمال الجغرافي · {cardinalAr(fix.bearing)}
            {km != null ? ` · ${arNum(Math.round(km))} كم` : ""}
          </p>
        ) : !fix ? (
          <p className="mt-2 text-center text-sm text-muted">
            الاتجاه يُحسب على الجهاز من موقع الهاتف إلى الكعبة، بمعادلة قبلة جوجل، بلا أسماء مدن وبلا إنترنت بعد الإذن.
          </p>
        ) : null}

        {err ? <p className="mt-3 text-center text-sm text-danger">{err}</p> : null}

        <div className="mt-6">
          <Button className="w-full" onClick={start} disabled={starting}>
            {starting ? "…" : fix ? "تحديث الموقع" : "تحديد الموقع من الهاتف"}
          </Button>
        </div>
      </main>
    </AppShell>
  );
}