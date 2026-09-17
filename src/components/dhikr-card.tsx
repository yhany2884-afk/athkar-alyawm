import { Link } from "@tanstack/react-router";
import type { Dhikr } from "@/lib/adhkar/types";
import { cn, countLabel } from "@/lib/utils";

export function DhikrCard({
  dhikr,
  current,
  from,
}: {
  dhikr: Dhikr;
  current: number;
  from?: string;
}) {
  const done = current >= dhikr.count;
  return (
    <Link
      to="/dhikr/$id"
      params={{ id: dhikr.id }}
      search={from ? { from } : undefined}
      className={cn("rule tap block py-3.5", done && "opacity-70")}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{dhikr.title}</span>
        <span className="text-xs tabular-nums text-muted">
          {done ? "تمّ" : `${current}/${dhikr.count}`}
        </span>
      </span>
      <p className="font-arabic mt-2 line-clamp-2 text-lg leading-relaxed">
        {dhikr.arabic}
      </p>
      <p className="mt-2 text-xs text-muted">
        {countLabel(dhikr.count)} · {dhikr.when}
      </p>
    </Link>
  );
}
