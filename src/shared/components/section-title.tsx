import type { ReactNode } from "react";

import { cn } from "@shared/lib/utils";

type SectionTitleProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionTitle({
  title,
  description,
  actions,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-title text-foreground">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-body text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
