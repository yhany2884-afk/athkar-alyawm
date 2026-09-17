import { useCallback, useEffect, useRef, useState } from "react";
import {
  headingFromEvent,
  lerpAngle,
  magneticDeclination,
} from "@/lib/qibla";
import { useAppStore } from "@/lib/store";

export type QiblaLive = {
  heading: number | null;
  starting: boolean;
  err: string | null;
  start: () => void;
};

export function useQibla(): QiblaLive {
  const setQibla = useAppStore((s) => s.setQibla);
  const [heading, setHeading] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const smooth = useRef<number | null>(null);
  const geoId = useRef<number | null>(null);
  const absUsed = useRef(false);

  const onPos = useCallback(
    (lat: number, lng: number) => {
      setQibla(lat, lng);
      setErr(null);
    },
    [setQibla],
  );

  const watchGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setErr("الموقع غير متاح على هذا الجهاز.");
      return;
    }
    if (geoId.current != null) return;
    geoId.current = navigator.geolocation.watchPosition(
      (pos) => onPos(pos.coords.latitude, pos.coords.longitude),
      () => {
        if (!useAppStore.getState().qibla) {
          setErr("اسمح بالوصول للموقع مرة واحدة. بعدها تعمل القبلة بلا إنترنت.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 86_400_000, timeout: 20_000 },
    );
  }, [onPos]);

  const onOrient = useCallback(
    (e: DeviceOrientationEvent, abs: boolean) => {
      if (abs) absUsed.current = true;
      else if (absUsed.current) return;
      const mag = headingFromEvent(e);
      if (mag == null) return;
      const loc = useAppStore.getState().qibla;
      const dec = loc ? magneticDeclination(loc.lat, loc.lng) : 0;
      const trueH = (mag + dec + 360) % 360;
      if (smooth.current == null) smooth.current = trueH;
      else smooth.current = lerpAngle(smooth.current, trueH, 0.22);
      setHeading(smooth.current);
    },
    [],
  );

  const bindOrient = useCallback(() => {
    const abs = (e: Event) => onOrient(e as DeviceOrientationEvent, true);
    const rel = (e: Event) => onOrient(e as DeviceOrientationEvent, false);
    window.addEventListener("deviceorientationabsolute", abs);
    window.addEventListener("deviceorientation", rel);
    return () => {
      window.removeEventListener("deviceorientationabsolute", abs);
      window.removeEventListener("deviceorientation", rel);
    };
  }, [onOrient]);

  useEffect(() => {
    const unbind = bindOrient();
    if (navigator.geolocation) {
      if (useAppStore.getState().qibla) watchGeo();
      else if (navigator.permissions) {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((s) => {
            if (s.state === "granted") watchGeo();
          })
          .catch(() => undefined);
      }
    }
    return () => {
      unbind();
      if (geoId.current != null) {
        navigator.geolocation.clearWatch(geoId.current);
        geoId.current = null;
      }
    };
  }, [bindOrient, watchGeo]);

  const start = useCallback(() => {
    setStarting(true);
    setErr(null);
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    const perm =
      typeof DOE.requestPermission === "function"
        ? DOE.requestPermission().catch(() => "denied")
        : Promise.resolve("granted");
    void perm.then((p) => {
      if (p !== "granted") {
        setErr("اسمح للبوصلة من إعدادات المتصفح.");
      }
      watchGeo();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => onPos(pos.coords.latitude, pos.coords.longitude),
          () => undefined,
          { enableHighAccuracy: true, maximumAge: 86_400_000, timeout: 12_000 },
        );
      }
      setStarting(false);
    });
  }, [onPos, watchGeo]);

  return { heading, starting, err, start };
}
