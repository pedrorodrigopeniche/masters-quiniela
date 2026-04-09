import type { TournamentPlayer } from "../types";
import { mockProvider } from "./mock";

export interface GolfDataProvider {
  getLeaderboard(): Promise<TournamentPlayer[]>;
}

export type ProviderName = "mock";

export function getProvider(name: ProviderName): GolfDataProvider {
  switch (name) {
    case "mock":
      return mockProvider;
  }
}