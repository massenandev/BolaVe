import { Match, Stadium, Team, type MatchStatus } from "@domain/entities";

import type {
  WorldCupMatchDto,
  WorldCupStadiumDto,
  WorldCupTeamDto,
} from "./contracts";
import {
  normalizeCountry,
  normalizeOptionalText,
  normalizePositiveInteger,
  normalizeScore,
  normalizeTeamName,
  normalizeText,
  normalizeUtcDate,
} from "./normalizers";

type MatchMapperContext = {
  teamsById: Map<string, Team>;
  stadiumsById: Map<string, Stadium>;
};

export function mapTeamDtoToDomain(team: WorldCupTeamDto): Team {
  return new Team({
    id: normalizeText(team.id),
    name: normalizeText(team.name_en),
    country: normalizeCountry(team.name_en),
    abbreviation: normalizeOptionalText(team.fifa_code),
  });
}

export function mapStadiumDtoToDomain(stadium: WorldCupStadiumDto): Stadium {
  return new Stadium({
    id: normalizeText(stadium.id),
    name: normalizeText(stadium.name_en),
    city: normalizeText(stadium.city_en),
    country: normalizeCountry(stadium.country_en),
    capacity: normalizePositiveInteger(stadium.capacity),
  });
}

export function mapMatchDtoToDomain(
  match: WorldCupMatchDto,
  context: MatchMapperContext,
): Match {
  const status = mapMatchStatus(match);

  return new Match({
    id: match.id,
    homeTeam: resolveMatchTeam(match, "home", context.teamsById),
    awayTeam: resolveMatchTeam(match, "away", context.teamsById),
    stadium: resolveMatchStadium(match, context.stadiumsById),
    startsAt: normalizeUtcDate(match.local_date),
    status,
    score:
      status === "finished"
        ? {
            home: normalizeScore(match.home_score),
            away: normalizeScore(match.away_score),
          }
        : undefined,
  });
}

function resolveMatchTeam(
  match: WorldCupMatchDto,
  side: "home" | "away",
  teamsById: Map<string, Team>,
): Team {
  const teamId = side === "home" ? match.home_team_id : match.away_team_id;
  const team = teamsById.get(teamId);

  if (team) {
    return team;
  }

  const name =
    side === "home"
      ? normalizeTeamName(
          match.home_team_id,
          match.home_team_name_en,
          match.home_team_label,
        )
      : normalizeTeamName(
          match.away_team_id,
          match.away_team_name_en,
          match.away_team_label,
        );

  return new Team({
    id: `${match.id}-${side}-tbd`,
    name,
    country: "TBD",
  });
}

function resolveMatchStadium(
  match: WorldCupMatchDto,
  stadiumsById: Map<string, Stadium>,
): Stadium {
  const stadium = stadiumsById.get(match.stadium_id);

  if (stadium) {
    return stadium;
  }

  return new Stadium({
    id: `${match.id}-stadium-tbd`,
    name: "Stadium TBD",
    city: "TBD",
    country: "TBD",
  });
}

function mapMatchStatus(match: WorldCupMatchDto): MatchStatus {
  if (match.finished === "TRUE" || match.time_elapsed === "finished") {
    return "finished";
  }

  if (match.time_elapsed === "live") {
    return "in_progress";
  }

  return "scheduled";
}
