import { createFileRoute, Outlet } from "@tanstack/react-router";
import { QURAN } from "@/lib/quran/load";

void QURAN.length;

export const Route = createFileRoute("/quran")({
  component: QuranLayout,
});

function QuranLayout() {
  return <Outlet />;
}
