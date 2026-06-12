import { CalendarDays, MapPin } from "lucide-react";

import { cn } from "@shared/lib/utils";

import {
  type BusinessMatch,
  formatDate,
  formatStage,
  formatTime,
  formatVenue,
  MatchStatusBadge,
} from "./match-card";

type MatchUpcomingProps = {
  match: BusinessMatch;
  className?: string;
};

export function MatchUpcoming({ match, className }: MatchUpcomingProps) {
  return (
    <article
      className={cn(
        "rounded-md border border-border bg-surface p-4 shadow-xs",
        "sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <MatchStatusBadge status={match.status} />
          <span className="text-caption uppercase text-muted">
            {formatStage(match.stage, match.group)}
          </span>
        </div>

        <h3 className="mt-3 text-callout font-semibold text-foreground">
          <span className="block truncate">{match.homeTeam}</span>
          <span className="block truncate text-muted-foreground">
            {match.awayTeam}
          </span>
        </h3>

        <div className="mt-4 grid gap-2 text-caption text-muted-foreground sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {formatDate(match.startsAt)} · {formatTime(match.startsAt)}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{formatVenue(match.stadium)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex h-12 w-full items-center justify-center rounded-md bg-surface-muted text-caption font-semibold uppercase text-muted sm:mt-0 sm:h-16 sm:w-16">
        {formatTime(match.startsAt)}
      </div>
    </article>
  );
}
