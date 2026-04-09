import { NextResponse } from "next/server";
import type { TournamentPlayer } from "../../../lib/types";
import { participants } from "../../../data/quiniela";
import { computeRanking } from "../../../lib/scoring";
import { getProvider } from "../../../lib/providers";

export async function GET() {
  const provider = getProvider("mock");
  const leaderboard = await provider.getLeaderboard();

  const playerMap = new Map<string, TournamentPlayer>(
    leaderboard.map((p) => [p.id, p])
  );

  const results = computeRanking(participants, playerMap);

  return NextResponse.json({
    provider: "mock",
    lastUpdated: new Date().toISOString(),
    totalParticipants: participants.length,
    totalPlayers: leaderboard.length,
    results,
  });
}