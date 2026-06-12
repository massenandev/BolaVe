import { Stadium } from "./stadium";
import { Team } from "./team";

export type MatchStatus = "scheduled" | "in_progress" | "finished" | "cancelled";

export type MatchScore = {
  home: number;
  away: number;
};

export type MatchProps = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  stadium: Stadium;
  startsAt: Date;
  status?: MatchStatus;
  score?: MatchScore;
};

export class Match {
  private readonly props: Required<Omit<MatchProps, "score">> &
    Pick<MatchProps, "score">;

  constructor(props: MatchProps) {
    this.validate(props);

    this.props = {
      ...props,
      id: props.id.trim(),
      startsAt: new Date(props.startsAt),
      status: props.status ?? "scheduled",
      score: props.score ? { ...props.score } : undefined,
    };
  }

  get id(): string {
    return this.props.id;
  }

  get homeTeam(): Team {
    return this.props.homeTeam;
  }

  get awayTeam(): Team {
    return this.props.awayTeam;
  }

  get stadium(): Stadium {
    return this.props.stadium;
  }

  get startsAt(): Date {
    return new Date(this.props.startsAt);
  }

  get status(): MatchStatus {
    return this.props.status;
  }

  get score(): MatchScore | undefined {
    return this.props.score ? { ...this.props.score } : undefined;
  }

  get winner(): Team | undefined {
    if (!this.props.score || this.props.score.home === this.props.score.away) {
      return undefined;
    }

    return this.props.score.home > this.props.score.away
      ? this.props.homeTeam
      : this.props.awayTeam;
  }

  get isDraw(): boolean {
    return Boolean(
      this.props.score && this.props.score.home === this.props.score.away,
    );
  }

  equals(match: Match): boolean {
    return this.id === match.id;
  }

  toJSON(): MatchProps {
    return {
      ...this.props,
      startsAt: new Date(this.props.startsAt),
      score: this.score,
    };
  }

  private validate(props: MatchProps): void {
    if (!props.id.trim()) {
      throw new Error("Match id is required.");
    }

    if (props.homeTeam.equals(props.awayTeam)) {
      throw new Error("Match teams must be different.");
    }

    if (Number.isNaN(props.startsAt.getTime())) {
      throw new Error("Match start date is invalid.");
    }

    if (props.score) {
      this.validateScore(props.score);
    }

    if (props.status && props.score && props.status !== "finished") {
      throw new Error("Only finished matches can have a score.");
    }
  }

  private validateScore(score: MatchScore): void {
    if (!Number.isInteger(score.home) || score.home < 0) {
      throw new Error("Home score must be a non-negative integer.");
    }

    if (!Number.isInteger(score.away) || score.away < 0) {
      throw new Error("Away score must be a non-negative integer.");
    }
  }
}
