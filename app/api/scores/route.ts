import { NextResponse } from "next/server";
import { getLeaderboardData } from "../../../lib/leaderboard";

export async function GET() {
  const data = await getLeaderboardData();
  return NextResponse.json(data);
}