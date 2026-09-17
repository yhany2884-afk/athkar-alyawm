import { formatDeg } from "@/lib/qibla";

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

export function QiblaCompass({
  heading,
  qibla,
  aligned,
}: {
  heading: number | null;
  qibla: number | null;
  aligned: boolean;
}) {
  const rose = heading == null ? 0 : -heading;

  return (
    <div className="compass-wrap" dir="ltr">
      <svg
        viewBox="0 0 220 220"
        className="compass-svg"
        role="img"
        aria-label="بوصلة القبلة"
      >
        <circle
          cx="110"
          cy="110"
          r="104"
          className={aligned ? "compass-outer is-on" : "compass-outer"}
        />
        <circle cx="110" cy="110" r="96" className="compass-face" />

        <g transform={`rotate(${rose} 110 110)`}>
          {TICKS.map((d) => {
            const major = d % 30 === 0;
            const rad = ((d - 90) * Math.PI) / 180;
            const r1 = major ? 78 : 84;
            const r2 = 94;
            const x1 = 110 + r1 * Math.cos(rad);
            const y1 = 110 + r1 * Math.sin(rad);
            const x2 = 110 + r2 * Math.cos(rad);
            const y2 = 110 + r2 * Math.sin(rad);
            return (
              <line
                key={d}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={major ? "tick-major" : "tick-minor"}
              />
            );
          })}
          <text x="110" y="40" textAnchor="middle" className="rose-label">
            شمال
          </text>
          <text x="186" y="114" textAnchor="middle" className="rose-label">
            شرق
          </text>
          <text x="110" y="190" textAnchor="middle" className="rose-label">
            جنوب
          </text>
          <text x="34" y="114" textAnchor="middle" className="rose-label">
            غرب
          </text>

          {Number.isFinite(qibla) ? (
            <g transform={`rotate(${qibla} 110 110)`}>
              <rect x="103" y="16" width="14" height="16" className="kaaba-body" />
              <rect x="103" y="22" width="14" height="3.2" className="kaaba-band" />
            </g>
          ) : null}
        </g>

        <polygon points="110,6 102,20 118,20" className="compass-ahead" />
        <circle cx="110" cy="110" r="28" className="compass-hub" />
        <text x="110" y="116" textAnchor="middle" className="compass-deg">
          {qibla != null ? formatDeg(qibla) : "—"}
        </text>
      </svg>
    </div>
  );
}
