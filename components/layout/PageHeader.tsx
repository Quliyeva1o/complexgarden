import Image from "next/image";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/catalog/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { World } from "@/lib/types";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  lead?: string;
  /** Breadcrumb — "Ana səhifə" avtomatik əlavə olunur, son element cari səhifədir */
  crumbs: Crumb[];
  /** Dünya rəngində fon (pool/garden); verilməsə fonsuz */
  world?: World;
  image?: string;
  children?: ReactNode;
};

/** Daxili səhifələrin başlıq zolağı — bütün səhifələrdə eyni ölçü və boşluqlar */
export async function PageHeader({ title, lead, crumbs, world, image, children }: PageHeaderProps) {
  const locale = await getLocale();
  const tinted = Boolean(world);

  return (
    <Section spacing="none" className="pt-6 pb-8">
      <Container>
        <div
          className={cn(
            "grid items-center gap-6 overflow-hidden",
            tinted && "rounded-hero p-6 sm:p-10",
            world === "pool" && "world-pool bg-pool",
            world === "garden" && "world-garden bg-garden",
            image && "md:grid-cols-[1fr_auto]",
          )}
        >
          <div className="flex flex-col items-start gap-4">
            <Breadcrumbs locale={locale} items={crumbs} />
            <h1 className="text-h1">{title}</h1>
            {lead && <p className="max-w-2xl text-lead">{lead}</p>}
            {children}
          </div>
          {image && (
            <div className="relative hidden size-44 overflow-hidden rounded-pill border-8 border-surface md:block lg:size-52">
              <Image src={image} alt="" fill priority sizes="208px" className="object-cover" />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
