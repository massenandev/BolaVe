import { CalendarDays, MapPin, Radio, Trophy, Users } from "lucide-react";

import { Container, PageHeader, SectionTitle } from "@shared/components";
import { cn } from "@shared/lib/utils";

import { getUpcomingTimeline } from "./internal-world-cup-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getUpcomingTimeline();
  const liveMatches = snapshot.matches.filter(
    (match) => match.status === "live",
  );
  const recentMatches = snapshot.matches
    .filter((match) => match.status === "finished")
    .slice(-4)
    .reverse();
  const nextMatches = snapshot.matches
    .filter((match) => match.status !== "finished")
    .slice(0, 8);
  const featuredMatches =
    liveMatches.length > 0 ? liveMatches : nextMatches.slice(0, 3);
  const matchesByDate = groupMatchesByDate(nextMatches);
  const groups = groupTeams(snapshot.teams);

  return (
    <main className="min-h-screen bg-background pb-16">
      <Container>
        <PageHeader
          eyebrow="World Cup 2026"
          title="Timeline"
          description="Dados carregados direto da World Cup 2026 API, sem banco de dados local."
          actions={
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-caption text-muted-foreground shadow-xs">
              <Radio className="h-4 w-4 text-success" aria-hidden="true" />
              API live
            </div>
          }
        />

        <section className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={CalendarDays}
            label="Jogos"
            value={snapshot.matches.length}
          />
          <Metric icon={Users} label="Selecoes" value={snapshot.teams.length} />
          <Metric
            icon={MapPin}
            label="Estadios"
            value={snapshot.stadiums.length}
          />
          <Metric icon={Trophy} label="Grupos" value={groups.length} />
        </section>

        <section className="space-y-4 py-4">
          <SectionTitle
            title={liveMatches.length > 0 ? "Ao vivo agora" : "Proximos jogos"}
            description={`Atualizado ${formatDateTime(snapshot.updatedAt)}.`}
          />
          <div className="grid gap-3 lg:grid-cols-3">
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={match} prominent />
            ))}
          </div>
        </section>

        {recentMatches.length > 0 ? (
          <section className="space-y-4 py-6">
            <SectionTitle title="Resultados recentes" />
            <div className="grid gap-3 md:grid-cols-2">
              {recentMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-8 py-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            <SectionTitle title="Agenda" />
            <div className="space-y-6">
              {matchesByDate.map(({ date, matches }) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-caption uppercase text-muted">{date}</h3>
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <SectionTitle title="Grupos" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {groups.slice(0, 6).map(({ group, teams }) => (
                <div
                  key={group}
                  className="rounded-md border border-border bg-surface p-4 shadow-xs"
                >
                  <h3 className="mb-3 text-caption uppercase text-muted">
                    Grupo {group}
                  </h3>
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between gap-3 text-body"
                      >
                        <span className="truncate text-foreground">
                          {team.name}
                        </span>
                        <span className="shrink-0 text-caption text-muted">
                          {team.fifaCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </Container>
    </main>
  );
}

type Match = Awaited<ReturnType<typeof getUpcomingTimeline>>["matches"][number];
type Team = Awaited<ReturnType<typeof getUpcomingTimeline>>["teams"][number];

type MetricProps = {
  icon: typeof CalendarDays;
  label: string;
  value: number;
};

function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-xs">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-caption text-muted">{label}</p>
    </div>
  );
}

function MatchCard({
  match,
  prominent = false,
}: {
  match: Match;
  prominent?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-md border border-border bg-surface p-4 shadow-xs",
        prominent && "border-border-strong shadow-sm",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-caption text-muted">
        <span>{formatStage(match.stage, match.group)}</span>
        <StatusBadge status={match.status} />
      </div>
      <div className="space-y-3">
        <TeamLine
          name={match.homeTeam}
          score={match.homeScore}
          showScore={match.status !== "scheduled"}
        />
        <TeamLine
          name={match.awayTeam}
          score={match.awayScore}
          showScore={match.status !== "scheduled"}
        />
      </div>
      <p className="mt-4 text-caption text-muted-foreground">
        {formatDateTime(match.startsAt)}
        {match.stadium ? ` · ${match.stadium.city}` : ""}
      </p>
    </article>
  );
}

function MatchRow({ match }: { match: Match }) {
  return (
    <article className="grid gap-3 rounded-md border border-border bg-surface p-4 shadow-xs sm:grid-cols-[5rem_1fr_auto] sm:items-center">
      <div className="text-caption text-muted">
        {formatTime(match.startsAt)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-body font-medium text-foreground">
          {match.homeTeam} vs {match.awayTeam}
        </p>
        <p className="truncate text-caption text-muted-foreground">
          {match.stadium?.name ?? "Estadio a confirmar"} ·{" "}
          {formatStage(match.stage, match.group)}
        </p>
      </div>
      <StatusBadge status={match.status} />
    </article>
  );
}

function TeamLine({
  name,
  score,
  showScore,
}: {
  name: string;
  score: number;
  showScore: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-callout font-medium text-foreground">
        {name}
      </span>
      {showScore ? (
        <span className="shrink-0 text-title tabular-nums text-foreground">
          {score}
        </span>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: Match["status"] }) {
  const labelByStatus = {
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
      )}
    >
      {labelByStatus[status]}
    </span>
  );
}

function groupMatchesByDate(matches: Match[]) {
  const grouped = new Map<string, Match[]>();

  for (const match of matches) {
    const key = formatDate(match.startsAt);
    grouped.set(key, [...(grouped.get(key) ?? []), match]);
  }

  return Array.from(grouped, ([date, dateMatches]) => ({
    date,
    matches: dateMatches,
  }));
}

function groupTeams(teams: Team[]) {
  const grouped = new Map<string, Team[]>();

  for (const team of teams) {
    grouped.set(team.group, [...(grouped.get(team.group) ?? []), team]);
  }

  return Array.from(grouped, ([group, groupTeams]) => ({
    group,
    teams: groupTeams,
  })).sort((a, b) => a.group.localeCompare(b.group));
}

function formatStage(stage: string, group: string) {
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(value);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
