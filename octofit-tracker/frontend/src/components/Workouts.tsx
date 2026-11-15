import { useApiData } from './useApiData.js';

type Suggestion = { title: string; reason?: string };

const DEMO_USER_EMAIL = 'mona@example.com';

export default function Workouts() {
  const { loading, error, data } = useApiData<{ suggestions: Suggestion[] }>(
    `/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`,
  );
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading && <p role="status">Loading workout suggestions…</p>}
        {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
        {!loading && !error && data && (
          data.suggestions.length === 0 ? (
            <p>No workout suggestions available.</p>
          ) : (
            <ul>
              {data.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion.title}{suggestion.reason ? ` — ${suggestion.reason}` : ''}</li>
              ))}
            </ul>
          )
        )}
      </div>
    </section>
  );
}
