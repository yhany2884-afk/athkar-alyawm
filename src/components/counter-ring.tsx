import { cn } from "@/lib/utils";

export function CounterRing({
  current,
  max,
  onTick,
  onReset,
  disabled,
}: {
  current: number;
  max: number;
  onTick: () => void;
  onReset: () => void;
  disabled?: boolean;
}) {
  const done = current >= max;
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onTick}
        disabled={disabled || done}
        aria-label={done ? "اكتمل الورد" : "زيادة العدّ"}
        className={cn(
          "folio tap flex h-40 w-40 flex-col items-center justify-center",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        )}
      >
        <span className="font-arabic text-5xl tabular-nums leading-none">
          {current}
        </span>
        <span className="mt-2 text-sm text-muted tabular-nums">من {max}</span>
        <span className="mt-3 text-xs text-muted">
          {done ? "أتممت" : "اضغط للعدّ"}
        </span>
      </button>
      <button
        type="button"
        onClick={onReset}
        className="min-h-10 px-3 text-sm text-muted hover:text-fg"
      >
        إعادة هذا الذكر
      </button>
    </div>
  );
}
