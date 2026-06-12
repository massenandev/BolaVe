import type {
  WorldCupSnapshot,
  WorldCupSnapshotRepository,
} from "@application/repositories";

import { mapValidDtos } from "../adapters";
import { WorldCupApiClient } from "../api-client";
import { withRepositoryFallback } from "../errors";
import {
  mapMatchDtoToDomain,
  mapStadiumDtoToDomain,
  mapTeamDtoToDomain,
} from "../mappers";
import {
  readMatchesResponse,
  readStadiumsResponse,
  readTeamsResponse,
} from "../validators";

export class WorldCupApiSnapshotRepository implements WorldCupSnapshotRepository {
  constructor(private readonly apiClient = new WorldCupApiClient()) {}

  async getSnapshot(): Promise<WorldCupSnapshot> {
    return withRepositoryFallback(
      async () => {
        const [teamsResponse, stadiumsResponse, matchesResponse] =
          await Promise.all([
            this.apiClient.get<unknown>("/get/teams").then(readTeamsResponse),
            this.apiClient
              .get<unknown>("/get/stadiums")
              .then(readStadiumsResponse),
            this.apiClient.get<unknown>("/get/games").then(readMatchesResponse),
          ]);

        const teams = mapValidDtos(
          teamsResponse.teams,
          mapTeamDtoToDomain,
        ).sort((a, b) => a.name.localeCompare(b.name));
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
      },
      {
        matches: [],
        stadiums: [],
        teams: [],
        updatedAt: new Date(),
      },
    );
  }
}
