import { headers } from "next/headers";

import type { ApiTimelineSnapshot } from "./api/_lib/world-cup-data";

export type TimelineSnapshot = Omit<ApiTimelineSnapshot, "matches" | "updatedAt"> & {
  matches: Array<
    Omit<ApiTimelineSnapshot["matches"][number], "startsAt"> & {
      startsAt: Date;
    }
  >;
  updatedAt: Date;
};

export async function getUpcomingTimeline(): Promise<TimelineSnapshot> {
  const response = await fetch(await getInternalApiUrl("/api/upcoming"), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Internal World Cup API failed: ${response.status}`);
  }

  const snapshot = (await response.json()) as ApiTimelineSnapshot;

  return {
    ...snapshot,
    matches: snapshot.matches.map((match) => ({
      ...match,
      startsAt: new Date(match.startsAt),
    })),
    updatedAt: new Date(snapshot.updatedAt),
  };
}

async function getInternalApiUrl(path: string): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}${path}`;
}
