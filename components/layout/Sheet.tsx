"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  closeLabel: string;
  children: ReactNode;
  /** full = bütün ekran (mobil menyu), top = yuxarıdan (axtarış), bottom = aşağıdan (filtrlər) */
  variant?: "full" | "top" | "bottom";
  header?: ReactNode;
  /** Panelin altında sabit qalan hissə (məs. "Nəticələri göstər" düyməsi) */
  footer?: ReactNode;
};

/**
 * Native <dialog> üzərində panel: fokus tələsi, Esc ilə bağlanma və arxa fonun
 * inert olması brauzerdən gəlir. Açıq olanda səhifənin sürüşməsi dayanır.
 */
export function Sheet({ open, onClose, label, closeLabel, children, variant = "full", header, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink-strong/40",
        variant === "full" ? "h-dvh w-full" : variant === "bottom" ? "mt-auto max-h-[88dvh] w-full" : "w-full",
      )}
    >
      <div
        className={cn(
          "flex flex-col bg-page",
          variant === "full" && "h-full",
          variant === "top" && "rounded-b-card px-container-pad pt-3 pb-5 shadow-card-hover",
          variant === "bottom" && "max-h-[88dvh] rounded-t-hero",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3", variant !== "top" && "border-b border-border px-container-pad py-3")}>
          {header}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-ink-strong/6 text-ink-strong outline-none hover:bg-ink-strong/10 focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {children}
        {footer && <div className="border-t border-border bg-page px-container-pad py-3">{footer}</div>}
      </div>
    </dialog>
  );
}
