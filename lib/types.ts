export interface Participant {
  id: string;
  name: string;
  playerIds: [string, string, string, string, string];
}

export interface TournamentPlayer {
  id: string;
  name: string;
  totalStrokes: number;
  relativeToPar: number;
  madeCut: boolean;
  status: "active" | "cut" | "wd" | "dq";
  position: number | null;
}

export interface RankedParticipantPlayer extends TournamentPlayer {
  rank: number | null;
}

export interface ParticipantResult {
  participant: Participant;
  players: RankedParticipantPlayer[];
  validScorers: RankedParticipantPlayer[];
  mainScore: number | null;
  tb4: number;
  tb5: number;
  validScorerCount: number;
  complete: boolean;
  rank: number;
  tied: boolean;
}