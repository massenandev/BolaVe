import { cn } from "@shared/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Carregando",
  className,
}: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border border-border bg-surface px-6 py-12 text-center",
        className,
      )}
      role="status"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-surface-subtle border-t-primary" />
      <p className="text-body text-muted-foreground">{label}</p>
    </div>
  );
}
