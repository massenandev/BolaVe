import type { Team } from "@domain/entities";

export interface TeamRepository {
  findAll(): Promise<Team[]>;
}
