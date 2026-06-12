import type { StadiumRepository } from "@application/repositories";

import { mapValidDtos } from "../adapters";
import { WorldCupApiClient } from "../api-client";
import { withRepositoryFallback } from "../errors";
import { mapStadiumDtoToDomain } from "../mappers";
import { readStadiumsResponse } from "../validators";

export class WorldCupStadiumRepository implements StadiumRepository {
  constructor(private readonly apiClient = new WorldCupApiClient()) {}

  async findAll() {
    return withRepositoryFallback(async () => {
      const response = readStadiumsResponse(
        await this.apiClient.get<unknown>("/get/stadiums"),
      );

      return mapValidDtos(response.stadiums, mapStadiumDtoToDomain).sort(
        (a, b) => a.name.localeCompare(b.name),
      );
    }, []);
  }
}
