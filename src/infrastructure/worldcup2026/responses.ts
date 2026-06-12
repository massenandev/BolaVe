import type { Match, Stadium, Team } from "@domain/entities";

export type WorldCupTeamsResponse = Team[];

export type WorldCupStadiumsResponse = Stadium[];

export type WorldCupMatchesResponse = Match[];

export type WorldCupDomainSnapshotResponse = {
  matches: Match[];
  teams: Team[];
  stadiums: Stadium[];
  updatedAt: Date;
};
