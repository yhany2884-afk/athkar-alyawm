import { cn } from "@/lib/utils";

export function TocRow({
  n,
  title,
  meta,
  className,
}: {
  n?: string | number;
  title: string;
  meta?: string;
  className?: string;
}) {
  return (
    <span className={cn("rule flex w-full items-baseline gap-3 py-3.5", className)}>
      {n != null ? (
        <span className="w-7 shrink-0 font-arabic text-lg tabular-nums text-accent">
          {n}
        </span>
      ) : null}
      <span className="font-medium">{title}</span>
      <span className="toc-dots" aria-hidden />
      {meta ? (
        <span className="max-w-[48%] shrink-0 text-left text-xs text-muted">
          {meta}
        </span>
      ) : null}
    </span>
  );
}
