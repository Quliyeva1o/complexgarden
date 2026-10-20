import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      lead: "text-lead",
      body: "text-body",
      small: "text-small",
      caption: "text-caption",
    },
    tone: {
      body: "text-ink",
      muted: "text-ink-muted",
      strong: "text-ink-strong",
    },
  },
  defaultVariants: { variant: "body", tone: "body" },
});

type TextProps = ComponentPropsWithoutRef<"p"> &
  VariantProps<typeof textVariants> & {
    as?: ElementType;
  };

export function Text({ as: Tag = "p", variant, tone, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ variant, tone }), className)} {...props} />;
}
