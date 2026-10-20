"use client";

import { useState } from "react";
import { siteConfig, themes, type ThemeName } from "@/config/site";
import { Pill } from "@/components/ui/Pill";

/** <html data-theme> atributunu dəyişir — palitranın bütün saytda dəyişdiyini yoxlamaq üçün */
export function ThemeSwitcher({ label }: { label: string }) {
  const [current, setCurrent] = useState<ThemeName>(siteConfig.theme);

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {themes.map((theme) => (
        <Pill
          key={theme}
          selected={current === theme}
          onClick={() => {
            document.documentElement.dataset.theme = theme;
            setCurrent(theme);
          }}
        >
          {theme}
        </Pill>
      ))}
    </div>
  );
}
