import type { Match, MatchStatus, Stadium, Team } from "@domain/entities";
import { getOrSetCache } from "@infrastructure/worldcup2026";
import {
  WorldCupApiSnapshotRepository,
  WorldCupMatchRepository,
} from "@infrastructure/worldcup2026/repositories";

const CACHE_TTL_MS = 5 * 60 * 1000;

const matchRepository = new WorldCupMatchRepository();
const snapshotRepository = new WorldCupApiSnapshotRepository();

export type ApiTeam = {
  id: string;
  name: string;
  country: string;
  fifaCode: string;
  group: string;
};

export type ApiStadium = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
};

export type ApiMatchStatus = "scheduled" | "live" | "finished";

export type ApiMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  group: string;
  matchday: number;
  startsAt: string;
  stadium: ApiStadium | null;
  status: ApiMatchStatus;
  stage: string;
};

export type ApiTimelineSnapshot = {
  matches: ApiMatch[];
  teams: ApiTeam[];
  stadiums: ApiStadium[];
  updatedAt: string;
};

export async function getApiMatches(): Promise<ApiMatch[]> {
  return getOrSetCache("internal-api:matches", CACHE_TTL_MS, async () => {
    const matches = await matchRepository.findAll();

    return matches.map(serializeMatch);
  });
}

export async function getApiMatch(id: string): Promise<ApiMatch | undefined> {
  const matches = await getApiMatches();

  return matches.find((match) => match.id === id);
}

export async function getApiUpcomingSnapshot(): Promise<ApiTimelineSnapshot> {
  return getOrSetCache("internal-api:upcoming", CACHE_TTL_MS, async () => {
    const snapshot = await snapshotRepository.getSnapshot();
    const upcomingMatches = snapshot.matches.filter(
      (match) => match.status !== "finished",
    );

    return {
      matches: upcomingMatches.map(serializeMatch),
      teams: snapshot.teams.map(serializeTeam),
      stadiums: snapshot.stadiums.map(serializeStadium),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  });
}

export function getApiCacheHeaders() {
  return {
    "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
  };
}

function serializeMatch(match: Match): ApiMatch {
  const score = match.score;

  return {
    id: match.id,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeScore: score?.home ?? 0,
    awayScore: score?.away ?? 0,
    group: "TBD",
    matchday: 0,
    startsAt: match.startsAt.toISOString(),
    stadium: serializeStadium(match.stadium),
    status: serializeMatchStatus(match.status),
    stage: "group",
  };
}

function serializeMatchStatus(status: MatchStatus): ApiMatchStatus {
  if (status === "finished") {
    return "finished";
  }

  if (status === "in_progress") {
    return "live";
  }

  return "scheduled";
}

function serializeTeam(team: Team): ApiTeam {
  return {
    id: team.id,
    name: team.name,
    country: team.country,
    fifaCode: team.abbreviation ?? "TBD",
    group: "TBD",
  };
}

function serializeStadium(stadium: Stadium): ApiStadium {
  return {
    id: stadium.id,
    name: stadium.name,
    city: stadium.city,
    country: stadium.country,
    capacity: stadium.capacity ?? null,
  };
}
