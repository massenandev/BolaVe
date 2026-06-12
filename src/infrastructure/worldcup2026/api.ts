import { mapValidDtos } from "./adapters";
import { WorldCupApiClient } from "./api-client";
import type {
  WorldCupMatchesDtoResponse,
  WorldCupMatchDto,
  WorldCupStadiumsDtoResponse,
  WorldCupStadiumDto,
  WorldCupTeamsDtoResponse,
  WorldCupTeamDto,
} from "./contracts";
import {
  mapMatchDtoToDomain,
  mapStadiumDtoToDomain,
  mapTeamDtoToDomain,
} from "./mappers";
import type {
  WorldCupDomainSnapshotResponse,
  WorldCupMatchesResponse,
  WorldCupStadiumsResponse,
  WorldCupTeamsResponse,
} from "./responses";
import type {
  WorldCupMatch,
  WorldCupMatchStatus,
  WorldCupSnapshot,
  WorldCupStadium,
  WorldCupTeam,
} from "./types";
import { withRepositoryFallback } from "./errors";
import {
  normalizeCountry,
  normalizePositiveInteger,
  normalizeScore,
  normalizeTeamName,
  normalizeText,
  normalizeUtcDate,
} from "./normalizers";
import {
  readMatchesResponse,
  readStadiumsResponse,
  readTeamsResponse,
} from "./validators";

const apiClient = new WorldCupApiClient();

export async function getWorldCupSnapshot(): Promise<WorldCupSnapshot> {
  const [teamsResponse, stadiumsResponse, gamesResponse] = await Promise.all([
    fetchTeams(),
    fetchStadiums(),
    fetchMatches(),
  ]);

  const teams = mapValidDtos(teamsResponse.teams, mapTeam);
  const stadiums = mapValidDtos(stadiumsResponse.stadiums, mapStadium);
  const stadiumsById = new Map(
    stadiums.map((stadium) => [stadium.id, stadium]),
  );

  return {
    teams: teams.sort(
      (a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id),
    ),
    stadiums: stadiums.sort((a, b) => a.name.localeCompare(b.name)),
    matches: gamesResponse.games
      .flatMap((game) =>
        mapValidDtos([game], (dto) => mapMatch(dto, stadiumsById)),
      )
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()),
    updatedAt: new Date(),
  };
}

export async function getWorldCupTeams(): Promise<WorldCupTeamsResponse> {
  const response = await fetchTeams();

  return mapValidDtos(response.teams, mapTeamDtoToDomain).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function getWorldCupStadiums(): Promise<WorldCupStadiumsResponse> {
  const response = await fetchStadiums();

  return mapValidDtos(response.stadiums, mapStadiumDtoToDomain).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function getWorldCupMatches(): Promise<WorldCupMatchesResponse> {
  const [teamsResponse, stadiumsResponse, matchesResponse] = await Promise.all([
    fetchTeams(),
    fetchStadiums(),
    fetchMatches(),
  ]);

  const teams = mapValidDtos(teamsResponse.teams, mapTeamDtoToDomain);
  const stadiums = mapValidDtos(
    stadiumsResponse.stadiums,
    mapStadiumDtoToDomain,
  );
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const stadiumsById = new Map(
    stadiums.map((stadium) => [stadium.id, stadium]),
  );

  return mapValidDtos(matchesResponse.games, (match) =>
    mapMatchDtoToDomain(match, { teamsById, stadiumsById }),
  ).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export async function getWorldCupDomainSnapshot(): Promise<WorldCupDomainSnapshotResponse> {
  const [teamsResponse, stadiumsResponse, matchesResponse] = await Promise.all([
    fetchTeams(),
    fetchStadiums(),
    fetchMatches(),
  ]);

  const teams = mapValidDtos(teamsResponse.teams, mapTeamDtoToDomain).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  const stadiums = mapValidDtos(
    stadiumsResponse.stadiums,
    mapStadiumDtoToDomain,
  ).sort((a, b) => a.name.localeCompare(b.name));
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const stadiumsById = new Map(
    stadiums.map((stadium) => [stadium.id, stadium]),
  );

  return {
    teams,
    stadiums,
    matches: mapValidDtos(matchesResponse.games, (match) =>
      mapMatchDtoToDomain(match, { teamsById, stadiumsById }),
    ).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()),
    updatedAt: new Date(),
  };
}

function fetchTeams(): Promise<WorldCupTeamsDtoResponse> {
  return withRepositoryFallback(
    async () => readTeamsResponse(await apiClient.get<unknown>("/get/teams")),
    { teams: [] },
  );
}

function fetchStadiums(): Promise<WorldCupStadiumsDtoResponse> {
  return withRepositoryFallback(
    async () =>
      readStadiumsResponse(await apiClient.get<unknown>("/get/stadiums")),
    { stadiums: [] },
  );
}

function fetchMatches(): Promise<WorldCupMatchesDtoResponse> {
  return withRepositoryFallback(
    async () => readMatchesResponse(await apiClient.get<unknown>("/get/games")),
    { games: [] },
  );
}

function mapTeam(team: WorldCupTeamDto): WorldCupTeam {
  return {
    id: normalizeText(team.id),
    name: normalizeText(team.name_en),
    fifaCode: normalizeText(team.fifa_code, "TBD"),
    group: normalizeText(team.groups, "TBD"),
    flagUrl: normalizeText(team.flag, ""),
  };
}

function mapStadium(stadium: WorldCupStadiumDto): WorldCupStadium {
  return {
    id: normalizeText(stadium.id),
    name: normalizeText(stadium.name_en),
    fifaName: normalizeText(stadium.fifa_name, normalizeText(stadium.name_en)),
    city: normalizeText(stadium.city_en),
    country: normalizeCountry(stadium.country_en),
    capacity: normalizePositiveInteger(stadium.capacity) ?? 1,
    region: normalizeText(stadium.region, "TBD"),
  };
}

function mapMatch(
  game: WorldCupMatchDto,
  stadiumsById: Map<string, WorldCupStadium>,
): WorldCupMatch {
  return {
    id: normalizeText(game.id),
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
    homeScore: normalizeScore(game.home_score),
    awayScore: normalizeScore(game.away_score),
    group: normalizeText(game.group, "TBD"),
    matchday: normalizeScore(game.matchday),
    startsAt: normalizeUtcDate(game.local_date),
    stadium: stadiumsById.get(game.stadium_id),
    status: parseStatus(game),
    stage: normalizeText(game.type, "group"),
  };
}

function resolveTeamName(
  teamId: string,
  teamName: string | undefined,
  teamLabel: string | undefined,
): string {
  return normalizeTeamName(teamId, teamName, teamLabel);
}

function parseStatus(game: WorldCupMatchDto): WorldCupMatchStatus {
  if (game.finished === "TRUE" || game.time_elapsed === "finished") {
    return "finished";
  }

  if (game.time_elapsed === "live") {
    return "live";
  }

  return "scheduled";
}
