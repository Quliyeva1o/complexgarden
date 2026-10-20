import { cn } from "@/lib/utils";

type ProcessStepsProps = {
  steps: { title: string; text: string }[];
  className?: string;
};

/**
 * Ardıcıl addımlar (iş prosesi, "necə işləyir"). Nömrələr yalnız burada — məzmun həqiqətən ardıcıllıqdır.
 * Desktop-da addımlar üfüqi xətt ilə birləşir.
 */
export function ProcessSteps({ steps, className }: ProcessStepsProps) {
  return (
    <ol className={cn("grid gap-8 sm:grid-cols-2", steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3", className)}>
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary font-heading text-h4 text-on-primary tabular-nums">
              {i + 1}
            </span>
            {i < steps.length - 1 && <span aria-hidden className="hidden h-px flex-1 border-t border-dashed border-ink-strong/25 lg:block" />}
          </div>
          <h3 className="text-h4">{step.title}</h3>
          <p className="text-small text-ink-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
