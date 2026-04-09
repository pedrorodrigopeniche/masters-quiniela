import type { TournamentPlayer } from "../lib/types";
import { participants } from "../data/quiniela";
import { computeRanking } from "../lib/scoring";
import { getProvider } from "../lib/providers";

async function getData() {
  const provider = getProvider("mock");
  const leaderboard = await provider.getLeaderboard();

  const playerMap = new Map<string, TournamentPlayer>(
    leaderboard.map((p) => [p.id, p])
  );

  const results = computeRanking(participants, playerMap);

  return {
    provider: "mock",
    lastUpdated: new Date().toISOString(),
    totalParticipants: participants.length,
    totalPlayers: leaderboard.length,
    results,
  };
}

function formatRelativeToPar(value: number) {
  if (value === 0) return "E";
  if (value > 0) return `+${value}`;
  return `${value}`;
}

export default async function Page() {
  const data = await getData();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-emerald-400">
            Masters Pool
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Masters Quiniela
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300 sm:text-base">
            El score es la suma de los mejores 3 jugadores que sí pasaron el
            corte. Si hay empate, se desempata con el 4.º y luego con el 5.º
            mejor score válido.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-300">
            <div className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5">
              Participantes:{" "}
              <span className="font-semibold text-white">
                {data.totalParticipants}
              </span>
            </div>
            <div className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5">
              Última actualización:{" "}
              <span className="font-semibold text-white">
                {new Date(data.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          {data.results.map((r: any) => (
            <article
              key={r.participant.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
                      #{r.rank}
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {r.participant.name}
                      </h2>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {r.tied && (
                          <span className="rounded-full bg-yellow-500/15 px-2.5 py-1 text-yellow-300">
                            Empatado
                          </span>
                        )}

                        {!r.complete && (
                          <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-red-300">
                            Menos de 3 válidos
                          </span>
                        )}

                        <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-neutral-300">
                          Válidos: {r.validScorerCount}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:min-w-[260px]">
                  <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
                    <div className="text-xs text-neutral-400">Score</div>
                    <div className="mt-1 text-lg font-bold text-white">
                      {r.mainScore !== null ? r.mainScore : "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
                    <div className="text-xs text-neutral-400">TB4</div>
                    <div className="mt-1 text-lg font-bold text-white">
                      {Number.isFinite(r.tb4) ? r.tb4 : "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black/20 p-3">
                    <div className="text-xs text-neutral-400">TB5</div>
                    <div className="mt-1 text-lg font-bold text-white">
                      {Number.isFinite(r.tb5) ? r.tb5 : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {r.players.map((p: any) => {
                  const counts = r.validScorers.some((vp: any) => vp.id === p.id);

                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-3 ${
                        counts
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-neutral-800 bg-neutral-950"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-white">{p.name}</div>
                          <div className="mt-1 text-sm text-neutral-400">
                            {formatRelativeToPar(p.relativeToPar)}
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            p.status === "active"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : p.status === "wd"
                              ? "bg-orange-500/15 text-orange-300"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-neutral-400">
                        {counts ? "Cuenta para el score" : "No cuenta"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}