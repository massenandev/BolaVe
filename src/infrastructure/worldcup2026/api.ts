import type {
  WorldCupMatch,
  WorldCupMatchStatus,
  WorldCupSnapshot,
  WorldCupStadium,
  WorldCupTeam,
} from "./types";

const API_BASE_URL =
  process.env.WORLDCUP2026_API_BASE_URL ?? "https://worldcup26.ir";

const REVALIDATE_SECONDS = 60;

type ApiTeam = {
  id: string;
  name_en: string;
  fifa_code: string;
  groups: string;
  flag: string;
};

type ApiStadium = {
  id: string;
  name_en: string;
  fifa_name: string;
  city_en: string;
  country_en: string;
  capacity: number;
  region: string;
};

type ApiGame = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
};

type TeamsResponse = {
  teams: ApiTeam[];
};

type StadiumsResponse = {
  stadiums: ApiStadium[];
};

type GamesResponse = {
  games: ApiGame[];
};

export async function getWorldCupSnapshot(): Promise<WorldCupSnapshot> {
  const [teamsResponse, stadiumsResponse, gamesResponse] = await Promise.all([
    fetchApi<TeamsResponse>("/get/teams"),
    fetchApi<StadiumsResponse>("/get/stadiums"),
    fetchApi<GamesResponse>("/get/games"),
  ]);

  const teams = teamsResponse.teams.map(mapTeam);
  const stadiums = stadiumsResponse.stadiums.map(mapStadium);
  const stadiumsById = new Map(
    stadiums.map((stadium) => [stadium.id, stadium]),
  );

  return {
    teams: teams.sort(
      (a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id),
    ),
    stadiums: stadiums.sort((a, b) => a.name.localeCompare(b.name)),
    matches: gamesResponse.games
      .map((game) => mapMatch(game, stadiumsById))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()),
    updatedAt: new Date(),
  };
}

async function fetchApi<TResponse>(path: string): Promise<TResponse> {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (process.env.WORLDCUP2026_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.WORLDCUP2026_API_TOKEN}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `World Cup 2026 API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<TResponse>;
}

function mapTeam(team: ApiTeam): WorldCupTeam {
  return {
    id: team.id,
    name: team.name_en,
    fifaCode: team.fifa_code,
    group: team.groups,
    flagUrl: team.flag,
  };
}

function mapStadium(stadium: ApiStadium): WorldCupStadium {
  return {
    id: stadium.id,
    name: stadium.name_en,
    fifaName: stadium.fifa_name,
    city: stadium.city_en,
    country: stadium.country_en,
    capacity: stadium.capacity,
    region: stadium.region,
  };
}

function mapMatch(
  game: ApiGame,
  stadiumsById: Map<string, WorldCupStadium>,
): WorldCupMatch {
  return {
    id: game.id,
    homeTeam: resolveTeamName(
      game.home_team_id,
      game.home_team_name_en,
      game.home_team_label,
    ),
    awayTeam: resolveTeamName(
      game.away_team_id,
      game.away_team_name_en,
      game.away_team_label,
    ),
    homeScore: parseInteger(game.home_score),
    awayScore: parseInteger(game.away_score),
    group: game.group,
    matchday: parseInteger(game.matchday),
    startsAt: parseLocalDate(game.local_date),
    stadium: stadiumsById.get(game.stadium_id),
    status: parseStatus(game),
    stage: game.type,
  };
}

function resolveTeamName(
  teamId: string,
  teamName: string | undefined,
  teamLabel: string | undefined,
): string {
  if (teamId !== "0" && teamName) {
    return teamName;
  }

  return teamLabel ?? "TBD";
}

function parseStatus(game: ApiGame): WorldCupMatchStatus {
  if (game.finished === "TRUE" || game.time_elapsed === "finished") {
    return "finished";
  }

  if (game.time_elapsed === "live") {
    return "live";
  }

  return "scheduled";
}

function parseInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseLocalDate(value: string): Date {
  const [datePart, timePart] = value.split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}
