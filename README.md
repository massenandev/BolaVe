# World Cup Timeline - Next.js 2026 Match Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-lockfile-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

> A clean FIFA World Cup 2026 timeline app with upcoming fixtures, latest results, and a small internal REST API for matches and tournament snapshots.

World Cup Timeline is a **Next.js App Router** project that fetches FIFA World Cup 2026 data, maps it into domain entities, and exposes a lightweight UI plus JSON endpoints. It is designed as a focused match dashboard: fast to run locally, easy to adapt, and structured with clear domain, application, infrastructure, presentation, and shared layers.

## Why This Project?

| Feature | Details |
|---------|---------|
| Match Timeline | Displays the next scheduled matches and the most recent finished results |
| Internal REST API | Provides JSON endpoints for matches, individual match lookup, and upcoming tournament snapshots |
| External Data Adapter | Reads teams, stadiums, and matches from a configurable World Cup 2026 API source |
| Domain Modeling | Uses `Team`, `Stadium`, and `Match` entities with validation and normalized data |
| Resilient Fetching | Adds retries, in-memory caching, response validation, and degraded fallbacks |
| Modern Frontend | Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and lucide-react icons |
| Clean Architecture | Separates business entities, repositories, infrastructure adapters, and UI components |

## Quick Example

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Fetch all normalized matches from the internal API
curl http://localhost:3000/api/matches

# Fetch the upcoming timeline snapshot
curl http://localhost:3000/api/upcoming
```

Open the app at [http://localhost:3000](http://localhost:3000).

## Table of Contents

- [Key Features](#key-features)
- [Application Overview](#application-overview)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Package Scripts](#package-scripts)
- [API Endpoints](#api-endpoints)
- [Response Examples](#response-examples)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Caching and Revalidation](#caching-and-revalidation)
- [Development Notes](#development-notes)
- [Contributing](#contributing)

## Key Features

- **Upcoming Matches**: shows the next six non-finished World Cup matches.
- **Latest Results**: shows the six most recent finished matches.
- **Match Cards**: presents teams, scores, status, date, and stadium details.
- **Internal API Routes**: exposes normalized data from the Next.js app itself.
- **Configurable Source API**: defaults to `https://worldcup26.ir`, with environment overrides.
- **Runtime Validation**: validates incoming API payloads before mapping them into domain objects.
- **Retry Logic**: retries transient network or server failures before falling back.
- **Five-Minute Cache**: caches upstream and internal data for smoother local and deployed usage.
- **Typed Architecture**: keeps TypeScript types at the API, domain, and UI boundaries.

## Application Overview

| Area | Description |
|------|-------------|
| Home Page | Server-rendered dashboard with upcoming matches and latest results |
| Internal API | Next.js route handlers under `/api` |
| Domain Layer | Validated entities for matches, teams, and stadiums |
| Application Layer | Repository contracts for data access |
| Infrastructure Layer | World Cup API client, mappers, validators, cache, and repositories |
| Presentation Layer | Match UI components used by the home page |
| Shared Layer | Layout and utility components used across the app |

## Technologies

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | App Router, server components, route handlers, and revalidation |
| [React 19](https://react.dev/) | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | Static typing across the app |
| [Tailwind CSS](https://tailwindcss.com/) | Styling system |
| [lucide-react](https://lucide.dev/) | UI icons |
| [Radix UI Slot](https://www.radix-ui.com/) | Composable component primitives |
| [ESLint](https://eslint.org/) | Code linting |
| [Prettier](https://prettier.io/) | Formatting |
| [pnpm](https://pnpm.io/) | Package management |

## Getting Started

### Prerequisites

- Node.js 18.18 or newer
- pnpm 9 or newer

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd bolave

# Install dependencies
pnpm install

# Optional: create .env.local and configure the external data source

# Start local development
pnpm dev
```

If you do not create an environment file, the app uses the default public World Cup API base URL.

## Environment Variables

Create `.env.local` when you want to override the default data source or pass an API token.

```env
WORLDCUP2026_API_BASE_URL=https://worldcup26.ir
WORLDCUP2026_API_TOKEN=
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WORLDCUP2026_API_BASE_URL` | No | `https://worldcup26.ir` | Base URL used by the World Cup API client |
| `WORLDCUP2026_API_TOKEN` | No | empty | Optional bearer token sent as `Authorization: Bearer <token>` |

## Package Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm dev` | `next dev` | Start the local development server |
| `pnpm build` | `next build` | Create a production build |
| `pnpm start` | `next start` | Run the production server |
| `pnpm lint` | `eslint .` | Lint the project |
| `pnpm format` | `prettier --write .` | Format project files |
| `pnpm format:check` | `prettier --check .` | Check formatting without writing files |

## API Endpoints

The app exposes a small internal REST API from Next.js route handlers. Responses are JSON and include cache headers.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/matches` | Returns all normalized matches sorted by kickoff time |
| `GET` | `/api/matches/:id` | Returns one normalized match by ID |
| `GET` | `/api/upcoming` | Returns a snapshot containing upcoming matches, teams, stadiums, and `updatedAt` |

### Source API Calls

The infrastructure adapter currently reads from these upstream paths on the configured base URL:

| Upstream Path | Used For |
|---------------|----------|
| `/get/teams` | Team names, countries, FIFA codes, groups, and flags |
| `/get/stadiums` | Stadium names, cities, countries, capacities, and regions |
| `/get/games` | Fixtures, scores, dates, groups, matchdays, stadium IDs, and statuses |

## Response Examples

### `GET /api/matches`

```json
[
  {
    "id": "1",
    "homeTeam": "Mexico",
    "awayTeam": "TBD",
    "homeScore": 0,
    "awayScore": 0,
    "group": "TBD",
    "matchday": 0,
    "startsAt": "2026-06-11T19:00:00.000Z",
    "stadium": {
      "id": "1",
      "name": "Estadio Azteca",
      "city": "Mexico City",
      "country": "Mexico",
      "capacity": 87523
    },
    "status": "scheduled",
    "stage": "group"
  }
]
```

### `GET /api/matches/:id`

```json
{
  "id": "1",
  "homeTeam": "Mexico",
  "awayTeam": "TBD",
  "homeScore": 0,
  "awayScore": 0,
  "group": "TBD",
  "matchday": 0,
  "startsAt": "2026-06-11T19:00:00.000Z",
  "stadium": null,
  "status": "scheduled",
  "stage": "group"
}
```

If a match cannot be found, the endpoint returns:

```json
{
  "error": "Match not found."
}
```

### `GET /api/upcoming`

```json
{
  "matches": [],
  "teams": [],
  "stadiums": [],
  "updatedAt": "2026-06-12T19:30:00.000Z"
}
```

## Project Structure

```text
src/
  app/
    api/
      matches/
      upcoming/
    page.tsx
    internal-world-cup-api.ts
  application/
    repositories/
  domain/
    entities/
  infrastructure/
    worldcup2026/
      repositories/
      api-client.ts
      validators.ts
      mappers.ts
      normalizers.ts
      cache.ts
  presentation/
    components/
  shared/
    components/
    lib/
```

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Home dashboard rendered by the App Router |
| `src/app/api/*` | Internal JSON API route handlers |
| `src/app/internal-world-cup-api.ts` | Server-side helper for calling internal API routes |
| `src/domain/entities` | Core `Team`, `Stadium`, and `Match` models |
| `src/application/repositories` | Repository interfaces used by the app |
| `src/infrastructure/worldcup2026` | External API client, validation, mapping, cache, and concrete repositories |
| `src/presentation/components` | Match display components |
| `src/shared/components` | Reusable layout and state components |

## Data Flow

1. The home page calls the internal `/api/matches` route through `getInternalMatches`.
2. The route handler asks `WorldCupMatchRepository` for all matches.
3. The repository fetches teams, stadiums, and games from the external World Cup API.
4. Validators verify the upstream payload shape.
5. Mappers normalize DTOs into domain entities.
6. API serializers convert domain entities into stable JSON responses.
7. The UI filters matches into upcoming fixtures and latest results.

## Caching and Revalidation

| Cache Layer | Duration | Notes |
|-------------|----------|-------|
| API client cache | 300 seconds | In-memory cache keyed by base URL, path, and auth mode |
| Internal API cache | 300 seconds | Caches serialized matches and upcoming snapshots |
| Next.js fetch revalidation | 300 seconds | Used when server code calls internal API routes |
| Response headers | `s-maxage=300, stale-while-revalidate=600` | Allows shared caches to serve fresh and stale data |

## Development Notes

- The repository currently has no database dependency; data is read from the configured World Cup API.
- If the upstream API fails, repositories return empty fallback data instead of crashing the page.
- Match statuses are serialized as `scheduled`, `live`, or `finished`.
- Domain match statuses also support `in_progress` and `cancelled` internally.
- Some public response fields are placeholders today, such as `group: "TBD"`, `matchday: 0`, and `stage: "group"` in the internal API serializer.
- The UI copy is currently Portuguese for the home dashboard sections.

## Contributing

1. Create a feature branch.
2. Keep changes scoped to the relevant layer.
3. Run `pnpm lint` and `pnpm build` before opening a pull request.
4. Update this README when endpoints, environment variables, or setup steps change.
