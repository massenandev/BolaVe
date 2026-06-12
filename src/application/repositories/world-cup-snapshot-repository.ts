import type { Match, Stadium, Team } from "@domain/entities";

export type WorldCupSnapshot = {
  matches: Match[];
  stadiums: Stadium[];
  teams: Team[];
  updatedAt: Date;
};

export interface WorldCupSnapshotRepository {
  getSnapshot(): Promise<WorldCupSnapshot>;
}
