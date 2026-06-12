export type WorldCupApiErrorKind =
  | "network"
  | "http"
  | "parse"
  | "repository"
  | "unknown";

type WorldCupApiErrorOptions = {
  kind: WorldCupApiErrorKind;
  path?: string;
  status?: number;
  cause?: unknown;
};

export class WorldCupApiError extends Error {
  readonly kind: WorldCupApiErrorKind;
  readonly path: string | undefined;
  readonly status: number | undefined;
  override readonly cause: unknown;

  constructor(message: string, options: WorldCupApiErrorOptions) {
    super(message);
    this.name = "WorldCupApiError";
    this.kind = options.kind;
    this.path = options.path;
    this.status = options.status;
    this.cause = options.cause;
  }
}

export class WorldCupRepositoryError extends Error {
  override readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "WorldCupRepositoryError";
    this.cause = cause;
  }
}

export function toWorldCupApiError(
  error: unknown,
  path?: string,
): WorldCupApiError {
  if (error instanceof WorldCupApiError) {
    return error;
  }

  return new WorldCupApiError("World Cup 2026 API request failed.", {
    kind: "unknown",
    path,
    cause: error,
  });
}

export async function withRepositoryFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const repositoryError = new WorldCupRepositoryError(
      "World Cup 2026 repository returned degraded data.",
      error,
    );

    console.error(repositoryError);

    return fallback;
  }
}
