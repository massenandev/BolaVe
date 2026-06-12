import type { ReactNode } from "react";

import { cn } from "@shared/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-surface-muted text-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="text-title text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-body text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-6 flex items-center justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
