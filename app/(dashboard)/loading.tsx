export default function DashboardLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-32 animate-pulse rounded-[2rem] surface-card" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-[2rem] surface-card-soft" />
        <div className="h-32 animate-pulse rounded-[2rem] surface-card-soft" />
        <div className="h-32 animate-pulse rounded-[2rem] surface-card-soft" />
      </div>
      <div className="h-80 animate-pulse rounded-[2rem] surface-card-soft" />
    </div>
  );
}
