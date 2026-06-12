import type { TeamRepository } from "@application/repositories";

import { mapValidDtos } from "../adapters";
import { WorldCupApiClient } from "../api-client";
import { withRepositoryFallback } from "../errors";
import { mapTeamDtoToDomain } from "../mappers";
import { readTeamsResponse } from "../validators";

export class WorldCupTeamRepository implements TeamRepository {
  constructor(private readonly apiClient = new WorldCupApiClient()) {}

  async findAll() {
    return withRepositoryFallback(async () => {
      const response = readTeamsResponse(
        await this.apiClient.get<unknown>("/get/teams"),
      );

      return mapValidDtos(response.teams, mapTeamDtoToDomain).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }, []);
  }
}
