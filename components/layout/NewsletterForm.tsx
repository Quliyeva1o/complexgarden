"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter abunəsi. Hazırda backend yoxdur — uğurlu mesaj göstərilir.
 * TODO: e-poçt xidmətinə (Mailchimp / Brevo və s.) qoşulanda `onSubmit` içində sorğu göndərin.
 */
export function NewsletterForm() {
  const t = useTranslations("Footer");
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError(true);
      return;
    }
    setError(false);
    setDone(email.trim());
    setEmail("");
  }

  if (done) {
    return (
      <p role="status" className="inline-flex items-start gap-2 rounded-card bg-white/8 p-4 text-small text-white">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-(--link)" />
        {t("subscribed", { email: done })}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {t("emailLabel")}
      </label>
      <div
        className={cn(
          "flex h-14 items-center gap-2 rounded-pill border bg-white/8 p-1.5 pl-5 transition-colors duration-300",
          error ? "border-danger" : "border-white/15 focus-within:border-white/50",
        )}
      >
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent text-body text-white outline-none placeholder:text-white/55"
        />
        <button
          type="submit"
          className="group/sub inline-flex h-11 shrink-0 items-center gap-2 rounded-pill bg-fresh pr-1.5 pl-5 text-small font-medium text-on-fresh outline-none transition-colors duration-300 hover:bg-fresh-hover focus-visible:ring-2 focus-visible:ring-white"
        >
          {t("subscribe")}
          <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-pill bg-primary text-on-primary">
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/sub:rotate-45" />
          </span>
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="pl-5 text-small text-white">
          {t("emailError")}
        </p>
      )}
    </form>
  );
}
