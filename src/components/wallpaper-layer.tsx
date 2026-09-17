import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { WALLPAPER_BY_ID } from "@/lib/wallpapers";
import { loadCustomImage } from "@/lib/wallpaper-idb";

export function WallpaperLayer() {
  const lite = useAppStore((s) => s.settings.liteMode);
  const id = useAppStore((s) => s.settings.wallpaperId);
  const [customUrl, setCustomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (lite || !id.startsWith("c:")) {
      setCustomUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const cid = id.slice(2);
    let live = true;
    loadCustomImage(cid)
      .then((url) => {
        if (!live) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        setCustomUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      })
      .catch(() => {
        if (live) setCustomUrl(null);
      });
    return () => {
      live = false;
    };
  }, [id, lite]);

  if (lite || id === "none") return null;
  const builtin = WALLPAPER_BY_ID[id];
  const src = id.startsWith("c:") ? customUrl : builtin?.src;
  if (!src) return null;

  return (
    <div className="wallpaper-layer" aria-hidden="true">
      <img src={src} alt="" decoding="async" className="wallpaper-img" />
      <div className="wallpaper-tint" />
      <div className="wallpaper-veil" />
    </div>
  );
}
