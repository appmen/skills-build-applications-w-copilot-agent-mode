import { useApiData } from './useApiData.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const { loading, error, data } = useApiData<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {loading && <p role="status">Loading leaderboard…</p>}
        {error && <p role="alert">Unable to load leaderboard: {error}</p>}
        {!loading && !error && data && (
          data.leaderboard.length === 0 ? (
            <p>No leaderboard scores yet.</p>
          ) : (
            <ol>
              {data.leaderboard.map((entry) => (
                <li key={entry.rank}>{entry.teamName} — {entry.totalPoints} points</li>
              ))}
            </ol>
          )
        )}
      </div>
    </section>
  );
}
