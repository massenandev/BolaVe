import { NextResponse } from "next/server";

import {
  getApiCacheHeaders,
  getApiUpcomingSnapshot,
} from "../_lib/world-cup-data";

export const revalidate = 300;

export async function GET() {
  const snapshot = await getApiUpcomingSnapshot();

  return NextResponse.json(snapshot, {
    headers: getApiCacheHeaders(),
  });
}
