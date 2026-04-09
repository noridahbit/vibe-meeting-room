import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({
  actions,
  description,
  eyebrow,
  title,
}: PageIntroProps) {
  return (
    <section className="surface-card relative overflow-hidden rounded-[2rem] px-6 py-7 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_center,rgba(252,91,91,0.2),transparent_68%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--foreground-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
