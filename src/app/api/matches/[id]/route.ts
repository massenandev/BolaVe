import { NextResponse } from "next/server";

import { getApiCacheHeaders, getApiMatch } from "../../_lib/world-cup-data";

export const revalidate = 300;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const match = await getApiMatch(id);

  if (!match) {
    return NextResponse.json(
      { error: "Match not found." },
      {
        status: 404,
        headers: getApiCacheHeaders(),
      },
    );
  }

  return NextResponse.json(match, {
    headers: getApiCacheHeaders(),
  });
}
