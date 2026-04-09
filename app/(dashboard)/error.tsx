"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="surface-card rounded-[2rem] p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--danger-fg)]">
        Something went wrong
      </p>
      <h2 className="font-display mt-3 text-3xl font-semibold text-white">
        We couldn&apos;t load this page.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--foreground-soft)]">
        {error.message || "Please try again."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="cta-primary mt-6 rounded-full px-5 py-3 text-sm font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
