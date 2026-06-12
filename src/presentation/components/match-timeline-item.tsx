import { CalendarClock, MapPin } from "lucide-react";

import { cn } from "@shared/lib/utils";

import {
  type BusinessMatch,
  formatStage,
  formatTime,
  formatVenue,
  MatchStatusBadge,
} from "./match-card";

type MatchTimelineItemProps = {
  match: BusinessMatch;
  className?: string;
};

export function MatchTimelineItem({
  match,
  className,
}: MatchTimelineItemProps) {
  return (
    <article
      className={cn(
        "grid gap-3 rounded-md border border-border bg-surface p-4 shadow-xs",
        "sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-caption text-muted sm:block">
        <CalendarClock className="h-4 w-4 sm:hidden" aria-hidden="true" />
        <span>{formatTime(match.startsAt)}</span>
      </div>

      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-body font-medium text-foreground">
          {match.homeTeam} vs {match.awayTeam}
        </h3>
        <div className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {formatVenue(match.stadium)} ·{" "}
            {formatStage(match.stage, match.group)}
          </span>
        </div>
      </div>

      <MatchStatusBadge status={match.status} />
    </article>
  );
}
