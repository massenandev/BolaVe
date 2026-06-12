import { Trophy } from "lucide-react";

import { cn } from "@shared/lib/utils";

import {
  type BusinessMatch,
  formatDateTime,
  formatStage,
  formatVenue,
  getWinner,
  MatchStatusBadge,
  MatchWinnerIcon,
  TeamScoreLine,
} from "./match-card";

type MatchResultProps = {
  match: BusinessMatch;
  className?: string;
};

export function MatchResult({ match, className }: MatchResultProps) {
  const winner = getWinner(match);
  const isDraw = match.status === "finished" && winner === undefined;

  return (
    <article
      className={cn(
        "rounded-md border border-border bg-surface p-4 shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-caption uppercase text-muted">
              {formatStage(match.stage, match.group)}
            </p>
          </div>
          <p className="mt-1 truncate text-caption text-muted-foreground">
            {formatDateTime(match.startsAt)} · {formatVenue(match.stadium)}
          </p>
        </div>
        <MatchStatusBadge status={match.status} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <TeamScoreLine
            name={match.homeTeam}
            score={match.homeScore}
            showScore
            highlighted={winner === "home"}
          />
          <MatchWinnerIcon visible={winner === "home"} />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <TeamScoreLine
            name={match.awayTeam}
            score={match.awayScore}
            showScore
            highlighted={winner === "away"}
          />
          <MatchWinnerIcon visible={winner === "away"} />
        </div>
      </div>

      {isDraw ? (
        <p className="mt-4 rounded-sm bg-surface-muted px-3 py-2 text-caption text-muted-foreground">
          Empate no tempo regulamentar.
        </p>
      ) : null}
    </article>
  );
}
