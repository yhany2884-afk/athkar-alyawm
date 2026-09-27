import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export function Splash() {
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");

  const speed = useAppStore((s) => s.settings.animSpeed ?? 3);
  const scale = [1.7, 1.3, 1, 0.72, 0.45][Math.max(0, Math.min(4, speed - 1))] ?? 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    if (sessionStorage.getItem("athkar-open") === "1") {
      setPhase("gone");
      return;
    }
    const a = window.setTimeout(() => setPhase("out"), Math.round(780 * scale));
    return () => window.clearTimeout(a);
  }, [scale]);

  useEffect(() => {
    if (phase !== "out") return;
    const a = window.setTimeout(() => {
      sessionStorage.setItem("athkar-open", "1");
      setPhase("gone");
    }, Math.round(420 * scale));
    return () => window.clearTimeout(a);
  }, [phase, scale]);

  useEffect(() => {
    const onVis = () => {
      document.documentElement.dataset.app =
        document.visibilityState === "hidden" ? "closing" : "open";
    };
    document.documentElement.dataset.app = "open";
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={phase === "out" ? "splash is-out" : "splash"} aria-hidden="true">
      <img className="splash-mark" src="/icon-192.png" width={128} height={128} alt="" />
      <p className="splash-title">أذكار اليوم</p>
    </div>
  );
}
