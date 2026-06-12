export type StadiumProps = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
};

export class Stadium {
  private readonly props: StadiumProps;

  constructor(props: StadiumProps) {
    this.validate(props);

    this.props = {
      ...props,
      id: props.id.trim(),
      name: props.name.trim(),
      city: props.city.trim(),
      country: props.country.trim(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get city(): string {
    return this.props.city;
  }

  get country(): string {
    return this.props.country;
  }

  get capacity(): number | undefined {
    return this.props.capacity;
  }

  equals(stadium: Stadium): boolean {
    return this.id === stadium.id;
  }

  toJSON(): StadiumProps {
    return { ...this.props };
  }

  private validate(props: StadiumProps): void {
    if (!props.id.trim()) {
      throw new Error("Stadium id is required.");
    }

    if (!props.name.trim()) {
      throw new Error("Stadium name is required.");
    }

    if (!props.city.trim()) {
      throw new Error("Stadium city is required.");
    }

    if (!props.country.trim()) {
      throw new Error("Stadium country is required.");
    }

    if (props.capacity !== undefined && props.capacity <= 0) {
      throw new Error("Stadium capacity must be greater than zero.");
    }
  }
}
