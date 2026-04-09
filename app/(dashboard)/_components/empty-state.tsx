export function EmptyState({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <div className="surface-card-soft rounded-[2rem] p-10 text-center">
      <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">{body}</p>
    </div>
  );
}
