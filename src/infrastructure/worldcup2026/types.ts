export type WorldCupTeam = {
  id: string;
  name: string;
  fifaCode: string;
  group: string;
  flagUrl: string;
};

export type WorldCupStadium = {
  id: string;
  name: string;
  fifaName: string;
  city: string;
  country: string;
  capacity: number;
  region: string;
};

export type WorldCupMatchStatus = "scheduled" | "live" | "finished";

export type WorldCupMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  group: string;
  matchday: number;
  startsAt: Date;
  stadium: WorldCupStadium | undefined;
  status: WorldCupMatchStatus;
  stage: string;
};

export type WorldCupSnapshot = {
  matches: WorldCupMatch[];
  teams: WorldCupTeam[];
  stadiums: WorldCupStadium[];
  updatedAt: Date;
};
