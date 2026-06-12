import { NextResponse } from "next/server";

import { getApiCacheHeaders, getApiMatches } from "../_lib/world-cup-data";

export const revalidate = 300;

export async function GET() {
  const matches = await getApiMatches();

  return NextResponse.json(matches, {
    headers: getApiCacheHeaders(),
  });
}
