import { getOrSetCache } from "./cache";
import { WorldCupApiError } from "./errors";

const DEFAULT_BASE_URL = "https://worldcup26.ir";
const DEFAULT_REVALIDATE_SECONDS = 300;
const DEFAULT_RETRY_ATTEMPTS = 2;

export type WorldCupApiClientConfig = {
  baseUrl?: string;
  token?: string;
  revalidateSeconds?: number;
  retryAttempts?: number;
};

export class WorldCupApiClient {
  private readonly baseUrl: string;
  private readonly token: string | undefined;
  private readonly revalidateSeconds: number;
  private readonly retryAttempts: number;

  constructor(config: WorldCupApiClientConfig = {}) {
    this.baseUrl =
      config.baseUrl ??
      process.env.WORLDCUP2026_API_BASE_URL ??
      DEFAULT_BASE_URL;
    this.token = config.token ?? process.env.WORLDCUP2026_API_TOKEN;
    this.revalidateSeconds =
      config.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS;
    this.retryAttempts = config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    return getOrSetCache(
      this.buildCacheKey(path),
      this.revalidateSeconds * 1000,
      () => this.fetchJson<TResponse>(path),
    );
  }

  private async fetchJson<TResponse>(path: string): Promise<TResponse> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt += 1) {
      try {
        const response = await fetch(this.buildUrl(path), {
          headers,
          next: { revalidate: this.revalidateSeconds },
        });

        if (!response.ok) {
          throw new WorldCupApiError(
            `World Cup 2026 API request failed: ${response.status} ${response.statusText}`,
            {
              kind: "http",
              path,
              status: response.status,
            },
          );
        }

        try {
          return (await response.json()) as TResponse;
        } catch (error) {
          throw new WorldCupApiError(
            "World Cup 2026 API returned invalid JSON.",
            {
              kind: "parse",
              path,
              cause: error,
            },
          );
        }
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error) || attempt === this.retryAttempts) {
          break;
        }

        await this.delay(150 * (attempt + 1));
      }
    }

    if (lastError instanceof WorldCupApiError) {
      throw lastError;
    }

    throw new WorldCupApiError("World Cup 2026 API network request failed.", {
      kind: "network",
      path,
      cause: lastError,
    });
  }

  private buildUrl(path: string): string {
    const normalizedBaseUrl = this.baseUrl.replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
  }

  private buildCacheKey(path: string): string {
    return `${this.baseUrl}:${path}:${this.token ? "auth" : "public"}`;
  }

  private shouldRetry(error: unknown): boolean {
    if (!(error instanceof WorldCupApiError)) {
      return true;
    }

    return (
      error.kind === "network" ||
      error.status === undefined ||
      error.status >= 500
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
