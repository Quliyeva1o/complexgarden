"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";

export type ShowcaseProject = {
  slug: string;
  title: string;
  location: string;
  year: string;
  world: "pool" | "garden";
  before: string;
  after: string;
  tags: string[];
};

/** Əvvəl/sonra slayderi + layihə kartı (Greneris ruhu). Layihələr arasında pill ilə keçid. */
export function ProjectsShowcase({ projects, groupLabel }: { projects: ShowcaseProject[]; groupLabel: string }) {
  const [active, setActive] = useState(0);
  const project = projects[active];
  if (!project) return null;

  return (
    <div className="grid gap-grid lg:grid-cols-[1.5fr_1fr]">
      {/* key → layihə dəyişəndə slayder 50%-ə qayıdır */}
      <BeforeAfterSlider
        key={project.slug}
        before={project.before}
        after={project.after}
        alt={project.title}
        className="rounded-hero"
        sizes="(min-width: 1024px) 60vw, 100vw"
      />

      <div
        className={cn(
          "flex flex-col gap-6 rounded-hero p-6 sm:p-8",
          project.world === "pool" ? "world-pool bg-pool" : "world-garden bg-garden",
        )}
      >
        <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
          {projects.map((p, i) => (
            <Pill key={p.slug} selected={i === active} onClick={() => setActive(i)} className="h-9 px-4">
              {p.location}
            </Pill>
          ))}
        </div>

        <div aria-live="polite" className="flex flex-1 flex-col gap-4">
          <span className="text-caption">{project.year}</span>
          <h3 className="text-h2">{project.title}</h3>
          <p className="inline-flex items-center gap-2 text-body text-ink-strong">
            <MapPin aria-hidden className="size-4 text-(--world-ink)" />
            {project.location}
          </p>
          <ul className="mt-auto flex flex-wrap gap-2 pt-4">
            {project.tags.map((tag) => (
              <li key={tag} className="rounded-pill bg-surface px-3 py-1.5 text-small font-medium text-ink-strong">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
