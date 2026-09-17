import { useAppStore } from "@/lib/store";

export function PatternBg() {
  const pattern = useAppStore((s) => s.settings.pattern);
  const strength = useAppStore((s) => s.settings.patternStrength);
  const accent = useAppStore((s) => s.settings.accent);
  const fg = useAppStore((s) => s.settings.fg);
  const lite = useAppStore((s) => s.settings.liteMode);
  if (lite || pattern === "none") return null;
  const op = Math.max(0.03, Math.min(0.28, strength / 100));
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {pattern === "paper" && (
            <pattern
              id="p-paper"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="2" r="0.45" fill={fg} opacity={op} />
              <circle cx="4.5" cy="4.2" r="0.35" fill={fg} opacity={op * 0.7} />
            </pattern>
          )}
          {pattern === "rules" && (
            <pattern
              id="p-rules"
              width="8"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 27.5 H8"
                fill="none"
                stroke={fg}
                strokeWidth="0.6"
                opacity={op}
              />
            </pattern>
          )}
          {pattern === "geometry" && (
            <pattern
              id="p-geom"
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M28 8 L31 25 L48 28 L31 31 L28 48 L25 31 L8 28 L25 25 Z"
                fill="none"
                stroke={accent}
                strokeWidth="0.6"
                opacity={op}
              />
            </pattern>
          )}
          {pattern === "mashrabiya" && (
            <pattern
              id="p-mash"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="3"
                y="3"
                width="10"
                height="10"
                rx="5"
                fill="none"
                stroke={fg}
                strokeWidth="0.5"
                opacity={op}
              />
              <rect
                x="19"
                y="19"
                width="10"
                height="10"
                rx="5"
                fill="none"
                stroke={fg}
                strokeWidth="0.5"
                opacity={op}
              />
            </pattern>
          )}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#p-${pattern === "geometry" ? "geom" : pattern === "mashrabiya" ? "mash" : pattern})`}
        />
      </svg>
    </div>
  );
}
