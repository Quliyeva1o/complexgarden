import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "group/btn relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-pill font-medium whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow] duration-300 ease-out",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-(--bg-page)",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "[&_svg]:size-4.5 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary: "bg-secondary text-white hover:bg-secondary-hover",
        // Lime kampaniya düyməsi (Yard / Canopy) — mətn həmişə tünd
        fresh: "bg-fresh text-on-fresh hover:bg-fresh-hover",
        outline:
          "border border-ink-strong/20 bg-transparent text-ink-strong hover:border-ink-strong hover:bg-ink-strong hover:text-page",
        ghost: "bg-transparent text-ink-strong hover:bg-ink-strong/6",
        link: [
          "h-auto gap-1.5 rounded-sm px-0 text-(--link) underline decoration-current/30 underline-offset-4",
          "hover:text-(--link-hover) hover:decoration-current",
        ],
      },
      size: {
        sm: "h-10 px-5 text-small",
        md: "h-12 px-6 text-body",
        lg: "h-14 px-8 text-body",
        icon: "size-12 p-0",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

/** Düymənin sağındakı dairəvi ox (Growvi imzası). Hover-də ox 45° dönür. */
function ArrowBadge({ variant }: { variant: Variants["variant"] }) {
  const tone =
    variant === "fresh"
      ? "bg-primary text-on-primary"
      : variant === "outline" || variant === "ghost"
        ? "bg-ink-strong text-page group-hover/btn:bg-page group-hover/btn:text-ink-strong"
        : "bg-fresh text-on-fresh";

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-pill transition-[background-color,color] duration-300 ease-out",
        tone,
      )}
    >
      <ArrowUpRight className="transition-transform duration-300 ease-out group-hover/btn:rotate-45" />
    </span>
  );
}

type CommonProps = Variants & {
  /** Sağda dairəvi ox — əsas CTA-lar üçün */
  arrow?: boolean;
  children?: ReactNode;
};

type ButtonAsButton = ComponentPropsWithoutRef<"button"> & CommonProps & { href?: undefined };
type ButtonAsLink = Omit<ComponentPropsWithoutRef<"a">, "href"> &
  CommonProps & {
    href: string;
    /** true → yeni tabda açılan xarici link (wa.me və s.) */
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Düymə. `href` verilsə link kimi render olunur: daxili yollar dil prefiksli `Link`,
 * `http`, `tel:`, `mailto:`, `#` isə adi `<a>`.
 */
export function Button(props: ButtonProps) {
  const withArrow = Boolean(props.arrow) && props.variant !== "link" && props.size !== "icon";
  const arrowPadding = withArrow && "pr-1.5";

  if (props.href !== undefined) {
    const { variant, size, className, href, external, arrow, children, ...rest } = props;
    void arrow;
    const classes = cn(buttonVariants({ variant, size }), arrowPadding, className);
    const content = (
      <>
        {children}
        {withArrow && <ArrowBadge variant={variant} />}
      </>
    );

    if (href.startsWith("/") && !external) {
      return (
        <Link href={href} className={classes} {...rest}>
          {content}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {content}
      </a>
    );
  }

  const { variant, size, className, type = "button", arrow, children, ...rest } = props;
  void arrow;
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), arrowPadding, className)} {...rest}>
      {children}
      {withArrow && <ArrowBadge variant={variant} />}
    </button>
  );
}
