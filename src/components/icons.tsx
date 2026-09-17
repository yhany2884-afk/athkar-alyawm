import type { ReactElement, ReactNode, SVGProps } from "react";
import type { CategoryId } from "@/lib/adhkar/types";

type IconProps = SVGProps<SVGSVGElement>;

function I(props: IconProps & { children: ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconSun(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="13" r="4" />
      <path d="M12 3v2M6.2 6.2l1.4 1.4M3 13h2M18 13h2M16.4 7.6l1.4-1.4" />
    </I>
  );
}
export function IconMoon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M16 4.5A7.5 7.5 0 1 0 19.5 16 6 6 0 0 1 16 4.5Z" />
    </I>
  );
}
export function IconMosque(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 20V12l4-3 4 3v8" />
      <path d="M12 20V12l4-3 4 3v8" />
      <path d="M8 9V6.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1 4 1.5V9" />
      <path d="M12 5V3" />
      <path d="M3 20h18" />
    </I>
  );
}
export function IconPrayer(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 20h14" />
      <path d="M7 20v-6a5 5 0 0 1 10 0v6" />
      <path d="M12 9V5" />
      <circle cx="12" cy="3.6" r="1.1" />
    </I>
  );
}
export function IconSleep(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 16h16v2H4z" />
      <path d="M6 16V11a3 3 0 0 1 3-3h5a4 4 0 0 1 4 4v4" />
    </I>
  );
}
export function IconWake(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 18h16" />
      <path d="M8 18V9l4-3 4 3v9" />
      <path d="M12 2v2" />
    </I>
  );
}
export function IconBowl(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 11h14a7 7 0 0 1-14 0Z" />
      <path d="M12 4v3" />
    </I>
  );
}
export function IconDoor(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 20V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M4 20h16" />
      <path d="M14 12h.01" />
    </I>
  );
}
export function IconCompass(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.5 9.5-1.2 4.3-4.3 1.2 1.2-4.3z" />
    </I>
  );
}
export function IconShield(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 3 5 6v5c0 4.2 2.8 7.4 7 8.8 4.2-1.4 7-4.6 7-8.8V6z" />
    </I>
  );
}
export function IconTasbih(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="8" cy="14" r="1.3" />
      <circle cx="12" cy="16.5" r="1.3" />
      <circle cx="16" cy="14" r="1.3" />
      <circle cx="16.5" cy="9.5" r="1.3" />
      <circle cx="12" cy="7.5" r="1.3" />
      <circle cx="7.5" cy="9.5" r="1.3" />
      <path d="M12 6.2V3.8" />
    </I>
  );
}
export function IconMushaf(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 6.5c2.2-1.4 5-.4 8 .8 3-1.2 5.8-2.2 8-.8V18c-2.2-1.4-5-.4-8 .8-3-1.2-5.8-2.2-8-.8z" />
      <path d="M12 7.5v11" />
    </I>
  );
}
export function IconStar8(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 3l1.4 6.6L20 12l-6.6 2.4L12 21l-1.4-6.6L4 12l6.6-2.4z" />
    </I>
  );
}

export const CATEGORY_ICONS: Record<
  CategoryId,
  (p: IconProps) => ReactElement
> = {
  morning: IconSun,
  evening: IconMoon,
  "after-salah": IconMosque,
  salah: IconPrayer,
  sleep: IconSleep,
  wake: IconWake,
  food: IconBowl,
  home: IconDoor,
  travel: IconCompass,
  distress: IconShield,
  istighfar: IconTasbih,
  quran: IconMushaf,
};
