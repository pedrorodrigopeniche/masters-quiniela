import type { TournamentPlayer } from "./types";
import { participants } from "../data/quiniela";
import { computeRanking } from "./scoring";
import { getProvider } from "./providers";

export async function getLeaderboardData() {
  const provider = getProvider("mock");
  const leaderboard = await provider.getLeaderboard();

  const playerMap = new Map<string, TournamentPlayer>(
    leaderboard.map((p) => [p.id, p])
  );

  const results = computeRanking(participants, playerMap);

  return {
    provider: "mock" as const,
    lastUpdated: new Date().toISOString(),
    totalParticipants: participants.length,
    totalPlayers: leaderboard.length,
    results,
  };
}