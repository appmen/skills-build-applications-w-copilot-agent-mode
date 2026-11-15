import { useApiData } from './useApiData.js';

type Team = { name: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const { loading, error, data } = useApiData<{ teams: Team[] }>('/api/teams');
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading && <p role="status">Loading teams…</p>}
        {error && <p role="alert">Unable to load teams: {error}</p>}
        {!loading && !error && data && (
          data.teams.length === 0 ? (
            <p>No teams yet.</p>
          ) : (
            <ul>
              {data.teams.map((team, index) => (
                <li key={index}>{team.name}{team.mascot ? ` (mascot: ${team.mascot})` : ''} — {team.members?.length ?? 0} members</li>
              ))}
            </ul>
          )
        )}
      </div>
    </section>
  );
}
