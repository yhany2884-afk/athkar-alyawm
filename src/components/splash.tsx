import { useEffect, useState } from "react";

export function Splash() {
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");

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
    const a = window.setTimeout(() => setPhase("out"), 780);
    return () => window.clearTimeout(a);
  }, []);

  useEffect(() => {
    if (phase !== "out") return;
    const a = window.setTimeout(() => {
      sessionStorage.setItem("athkar-open", "1");
      setPhase("gone");
    }, 420);
    return () => window.clearTimeout(a);
  }, [phase]);

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
