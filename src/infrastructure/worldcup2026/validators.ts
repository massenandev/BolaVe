import type {
  WorldCupMatchesDtoResponse,
  WorldCupMatchDto,
  WorldCupStadiumDto,
  WorldCupStadiumsDtoResponse,
  WorldCupTeamDto,
  WorldCupTeamsDtoResponse,
} from "./contracts";

type UnknownRecord = Record<string, unknown>;

export function readTeamsResponse(value: unknown): WorldCupTeamsDtoResponse {
  return {
    teams: getArray(value, "teams").filter(isWorldCupTeamDto),
  };
}

export function readStadiumsResponse(
  value: unknown,
): WorldCupStadiumsDtoResponse {
  return {
    stadiums: getArray(value, "stadiums").filter(isWorldCupStadiumDto),
  };
}

export function readMatchesResponse(
  value: unknown,
): WorldCupMatchesDtoResponse {
  return {
    games: getArray(value, "games").filter(isWorldCupMatchDto),
  };
}

function getArray(value: unknown, key: string): unknown[] {
  if (!isRecord(value)) {
    return [];
  }

  return Array.isArray(value[key]) ? value[key] : [];
}

function isWorldCupTeamDto(value: unknown): value is WorldCupTeamDto {
  return isRecord(value) && hasText(value, "id") && hasText(value, "name_en");
}

function isWorldCupStadiumDto(value: unknown): value is WorldCupStadiumDto {
  return (
    isRecord(value) &&
    hasText(value, "id") &&
    hasText(value, "name_en") &&
    hasText(value, "city_en") &&
    hasText(value, "country_en")
  );
}

function isWorldCupMatchDto(value: unknown): value is WorldCupMatchDto {
  return (
    isRecord(value) &&
    hasText(value, "id") &&
    hasText(value, "home_team_id") &&
    hasText(value, "away_team_id") &&
    hasText(value, "local_date") &&
    hasText(value, "stadium_id")
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function hasText(value: UnknownRecord, key: string): boolean {
  return typeof value[key] === "string" && value[key].trim().length > 0;
}
