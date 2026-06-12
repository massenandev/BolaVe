import { CalendarClock, MapPin, Trophy } from "lucide-react";

import { cn } from "@shared/lib/utils";

export type BusinessMatchStatus = "scheduled" | "live" | "finished";

export type BusinessMatchStadium = {
  name?: string | null;
  city?: string | null;
};

export type BusinessMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  startsAt: Date | string;
  status: BusinessMatchStatus;
  stage: string;
  group: string;
  stadium?: BusinessMatchStadium | null;
};

type MatchCardProps = {
  match: BusinessMatch;
  prominent?: boolean;
  className?: string;
};

export function MatchCard({
  match,
  prominent = false,
  className,
}: MatchCardProps) {
  const showScore = match.status !== "scheduled";
  const winner = getWinner(match);

  return (
    <article
      className={cn(
        "rounded-md border border-border bg-surface p-4 shadow-xs",
        "transition-colors hover:border-border-strong",
        prominent && "border-border-strong bg-surface-elevated shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-caption uppercase text-muted">
            {formatStage(match.stage, match.group)}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
            <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{formatDateTime(match.startsAt)}</span>
          </div>
        </div>
        <MatchStatusBadge status={match.status} />
      </div>

      <div className="mt-5 space-y-3">
        <TeamScoreLine
          name={match.homeTeam}
          score={match.homeScore}
          showScore={showScore}
          highlighted={winner === "home"}
        />
        <TeamScoreLine
          name={match.awayTeam}
          score={match.awayScore}
          showScore={showScore}
          highlighted={winner === "away"}
        />
      </div>

      <div className="mt-5 flex min-w-0 items-center gap-2 border-t border-border pt-3 text-caption text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{formatVenue(match.stadium)}</span>
      </div>
    </article>
  );
}

type TeamScoreLineProps = {
  name: string;
  score: number;
  showScore: boolean;
  highlighted?: boolean;
};

export function TeamScoreLine({
  name,
  score,
  showScore,
  highlighted = false,
}: TeamScoreLineProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
        highlighted && "text-foreground",
      )}
    >
      <span
        className={cn(
          "min-w-0 truncate text-callout text-foreground",
          highlighted && "font-semibold",
        )}
      >
        {name}
      </span>
      {showScore ? (
        <span
          className={cn(
            "min-w-8 text-right text-title tabular-nums text-foreground",
            highlighted && "text-primary",
          )}
        >
          {score}
        </span>
      ) : null}
    </div>
  );
}

export function MatchStatusBadge({
  status,
  className,
}: {
  status: BusinessMatchStatus;
  className?: string;
}) {
  const labelByStatus: Record<BusinessMatchStatus, string> = {
    finished: "Finalizado",
    live: "Ao vivo",
    scheduled: "Marcado",
  };

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-sm border px-2 py-1 text-caption",
        status === "live" && "border-success/30 bg-success/10 text-success",
        status === "finished" && "border-border bg-surface-muted text-muted",
        status === "scheduled" &&
          "border-secondary/20 bg-secondary/10 text-secondary",
        className,
      )}
    >
      {labelByStatus[status]}
    </span>
  );
}

export function MatchWinnerIcon({
  visible,
  className,
}: {
  visible: boolean;
  className?: string;
}) {
  if (!visible) {
    return null;
  }

  return (
    <Trophy
      className={cn("h-4 w-4 shrink-0 text-primary", className)}
      aria-label="Vencedor"
    />
  );
}

export function getWinner(match: BusinessMatch): "home" | "away" | undefined {
  if (match.status !== "finished" || match.homeScore === match.awayScore) {
    return undefined;
  }

  return match.homeScore > match.awayScore ? "home" : "away";
}

export function formatStage(stage: string, group: string) {
  const stages: Record<string, string> = {
    group: `Grupo ${group}`,
    r32: "16 avos",
    r16: "Oitavas",
    qf: "Quartas",
    sf: "Semifinal",
    third: "3o lugar",
    final: "Final",
  };

  return stages[stage] ?? stage.toUpperCase();
}

export function formatVenue(stadium?: BusinessMatchStadium | null) {
  if (!stadium) {
    return "Estadio a confirmar";
  }

  if (stadium.name && stadium.city) {
    return `${stadium.name} · ${stadium.city}`;
  }

  return stadium.name ?? stadium.city ?? "Estadio a confirmar";
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(value));
}

export function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(value));
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(toDate(value));
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}
