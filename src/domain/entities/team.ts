export type TeamProps = {
  id: string;
  name: string;
  country: string;
  abbreviation?: string;
};

export class Team {
  private readonly props: TeamProps;

  constructor(props: TeamProps) {
    this.validate(props);

    this.props = {
      ...props,
      id: props.id.trim(),
      name: props.name.trim(),
      country: props.country.trim(),
      abbreviation: props.abbreviation?.trim().toUpperCase(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get country(): string {
    return this.props.country;
  }

  get abbreviation(): string | undefined {
    return this.props.abbreviation;
  }

  equals(team: Team): boolean {
    return this.id === team.id;
  }

  toJSON(): TeamProps {
    return { ...this.props };
  }

  private validate(props: TeamProps): void {
    if (!props.id.trim()) {
      throw new Error("Team id is required.");
    }

    if (!props.name.trim()) {
      throw new Error("Team name is required.");
    }

    if (!props.country.trim()) {
      throw new Error("Team country is required.");
    }

    if (props.abbreviation !== undefined && !props.abbreviation.trim()) {
      throw new Error("Team abbreviation cannot be empty.");
    }
  }
}
