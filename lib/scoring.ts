import type {
  Participant,
  TournamentPlayer,
  RankedParticipantPlayer,
  ParticipantResult,
} from "./types";

function resolvePlayer(
  id: string,
  playerMap: ReadonlyMap<string, TournamentPlayer>
): RankedParticipantPlayer | null {
  const p = playerMap.get(id);
  if (!p) return null;
  return { ...p, rank: null };
}

function buildValidScorers(
  players: RankedParticipantPlayer[]
): RankedParticipantPlayer[] {
  return players
    .filter((p) => p.madeCut)
    .sort((a, b) => a.totalStrokes - b.totalStrokes);
}

export function computeParticipantResult(
  participant: Participant,
  playerMap: ReadonlyMap<string, TournamentPlayer>
): ParticipantResult {
  const players: RankedParticipantPlayer[] = participant.playerIds.map(
    (id) =>
      resolvePlayer(id, playerMap) ?? {
        id,
        name: `Unresolved: ${id}`,
        totalStrokes: Number.POSITIVE_INFINITY,
        relativeToPar: 0,
        madeCut: false,
        status: "cut" as const,
        position: null,
        rank: null,
      }
  );

  const validScorers = buildValidScorers(players);
  const validScorerCount = validScorers.length;
  const complete = validScorerCount >= 3;

  const mainScore = complete
    ? validScorers[0].totalStrokes +
      validScorers[1].totalStrokes +
      validScorers[2].totalStrokes
    : null;

  const tb4 = validScorers[3]?.totalStrokes ?? Number.POSITIVE_INFINITY;
  const tb5 = validScorers[4]?.totalStrokes ?? Number.POSITIVE_INFINITY;

  return {
    participant,
    players,
    validScorers,
    mainScore,
    tb4,
    tb5,
    validScorerCount,
    complete,
    rank: 0,
    tied: false,
  };
}

/**
 * Compare two results.
 * Negative = a is better
 * Positive = b is better
 * 0 = tie
 */
export function compareResults(a: ParticipantResult, b: ParticipantResult): number {
  if (a.complete !== b.complete) {
    return a.complete ? -1 : 1;
  }

  if (a.complete && b.complete) {
    if (a.mainScore !== b.mainScore) {
      return (a.mainScore as number) - (b.mainScore as number);
    }

    if (a.tb4 !== b.tb4) {
      return a.tb4 - b.tb4;
    }

    if (a.tb5 !== b.tb5) {
      return a.tb5 - b.tb5;
    }

    return 0;
  }

  if (a.validScorerCount !== b.validScorerCount) {
    return b.validScorerCount - a.validScorerCount;
  }

  const sumA = a.validScorers.reduce((sum, p) => sum + p.totalStrokes, 0);
  const sumB = b.validScorers.reduce((sum, p) => sum + p.totalStrokes, 0);

  return sumA - sumB;
}

export function rankResults(results: ParticipantResult[]): ParticipantResult[] {
  const sorted = [...results].sort(compareResults);
  const ranked = sorted.map((r) => ({ ...r }));

  let i = 0;

  while (i < ranked.length) {
    let j = i + 1;

    while (j < ranked.length && compareResults(ranked[i], ranked[j]) === 0) {
      j++;
    }

    const rank = i + 1;
    const tied = j - i > 1;

    for (let k = i; k < j; k++) {
      ranked[k] = {
        ...ranked[k],
        rank,
        tied,
      };
    }

    i = j;
  }

  return ranked;
}

export function computeRanking(
  participants: readonly Participant[],
  playerMap: ReadonlyMap<string, TournamentPlayer>
): ParticipantResult[] {
  const results = participants.map((participant) =>
    computeParticipantResult(participant, playerMap)
  );

  return rankResults(results);
}