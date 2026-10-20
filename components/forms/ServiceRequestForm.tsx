"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { siteConfig } from "@/config/site";

type Fields = { name: string; phone: string; service: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

/** Azərbaycan nömrəsi: ən azı 9 rəqəm (50 123 45 67), +994 ilə 12 */
const phoneDigits = (value: string) => value.replace(/\D/g, "");
const isPhone = (value: string) => {
  const d = phoneDigits(value);
  return d.length === 9 || (d.length === 12 && d.startsWith("994")) || (d.length === 10 && d.startsWith("0"));
};

type ServiceRequestFormProps = {
  services: { value: string; label: string }[];
  /** Forma bir neçə yerdə ola bilər — id-lər unikal qalsın */
  idPrefix?: string;
  /** Xidmət səhifəsində həmin xidmət əvvəlcədən seçilir */
  defaultService?: string;
};

/**
 * Xidmət sorğusu. Validasiya: sahəni tərk edəndə və göndərəndə, xəta sahənin altında.
 * Hazırda backend yoxdur — uğurlu göndərişdə təsdiq və hazır WhatsApp mesajı göstərilir.
 * TODO: CRM / e-poçt qoşulanda `onSubmit` içində sorğu göndərin.
 */
export function ServiceRequestForm({ services, idPrefix = "req", defaultService = "" }: ServiceRequestFormProps) {
  const t = useTranslations("Home");
  const [fields, setFields] = useState<Fields>({ name: "", phone: "", service: defaultService, message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<Fields | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (f: Fields): Errors => ({
    ...(f.name.trim().length < 2 && { name: t("reqErrName") }),
    ...(!isPhone(f.phone) && { phone: t("reqErrPhone") }),
    ...(!f.service && { service: t("reqErrService") }),
  });

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    // Xəta artıq göstərilibsə, düzələn kimi götürülsün
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validate({ ...fields, [key]: value })[key] }));
  };

  const onBlur = (key: keyof Fields) => () => {
    if (!fields[key]) return;
    setErrors((e) => ({ ...e, [key]: validate(fields)[key] }));
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Fields)[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#${idPrefix}-${first}`)?.focus();
      return;
    }
    setSent(fields);
  }

  if (sent) {
    const serviceLabel = services.find((s) => s.value === sent.service)?.label ?? sent.service;
    const text = t("reqWaText", { name: sent.name, phone: sent.phone, service: serviceLabel, message: sent.message || "—" });
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <CheckCircle2 aria-hidden className="size-10 text-primary" strokeWidth={1.5} />
        <h3 className="text-h3">{t("reqSentTitle")}</h3>
        <p className="text-body">{t("reqSentText", { name: sent.name, phone: sent.phone })}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`} external variant="primary">
            <MessageCircle aria-hidden />
            {t("reqWhatsapp")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSent(null);
              setFields({ name: "", phone: "", service: defaultService, message: "" });
            }}
          >
            {t("reqAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Input
        id={`${idPrefix}-name`}
        label={t("reqName")}
        placeholder={t("reqNamePh")}
        autoComplete="name"
        required
        value={fields.name}
        onChange={(e) => set("name")(e.target.value)}
        onBlur={onBlur("name")}
        error={errors.name}
      />
      <Input
        id={`${idPrefix}-phone`}
        type="tel"
        inputMode="tel"
        label={t("reqPhone")}
        placeholder={t("reqPhonePh")}
        autoComplete="tel"
        required
        value={fields.phone}
        onChange={(e) => set("phone")(e.target.value)}
        onBlur={onBlur("phone")}
        error={errors.phone}
      />
      <div className="sm:col-span-2">
        <Select
          id={`${idPrefix}-service`}
          label={t("reqService")}
          placeholder={t("reqServicePh")}
          options={services}
          required
          value={fields.service}
          onChange={(e) => set("service")(e.target.value)}
          error={errors.service}
        />
      </div>
      <div className="sm:col-span-2">
        <Textarea
          id={`${idPrefix}-message`}
          label={t("reqMessage")}
          placeholder={t("reqMessagePh")}
          rows={3}
          value={fields.message}
          onChange={(e) => set("message")(e.target.value)}
        />
      </div>
      <Button type="submit" variant="fresh" size="lg" arrow className="justify-between sm:col-span-2">
        {t("reqSubmit")}
      </Button>
    </form>
  );
}
