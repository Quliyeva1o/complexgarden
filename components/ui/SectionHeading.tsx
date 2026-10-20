import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Semantik teq — vizual ölçü dəyişmir */
  as?: "h1" | "h2" | "h3";
  /** large = text-h1 (nadir hallarda) */
  size?: "default" | "large";
  /** Sağda (center-də altda) əlavə element, məs. "Hamısına bax" */
  action?: ReactNode;
  className?: string;
  id?: string;
};

/**
 * BÜTÜN bölmə başlıqları bu komponentlə qurulur:
 * eyebrow → başlıq → təsvir, aralarında eyni boşluq; altda məzmuna qədər sabit boşluq.
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  size = "default",
  action,
  className,
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-heading-bottom flex flex-col gap-heading-gap",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between md:gap-grid",
        className,
      )}
    >
      <div className={cn("flex max-w-3xl flex-col gap-heading-gap", centered ? "items-center" : "items-start")}>
        {eyebrow && <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>}
        <Tag id={id} className={size === "large" ? "text-h1" : "text-h2"}>
          {title}
        </Tag>
        {description && <p className="text-lead max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
