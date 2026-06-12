import type { Match } from "@domain/entities";

export interface MatchRepository {
  findAll(): Promise<Match[]>;
}
