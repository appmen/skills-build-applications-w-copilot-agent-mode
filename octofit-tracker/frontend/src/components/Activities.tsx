import { useApiData } from './useApiData.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const { loading, error, data } = useApiData<{ activities: Activity[] }>('/api/activities');
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {loading && <p role="status">Loading activities…</p>}
        {error && <p role="alert">Unable to load activities: {error}</p>}
        {!loading && !error && data && (
          data.activities.length === 0 ? (
            <p>No activities recorded yet.</p>
          ) : (
            <ul>
              {data.activities.map((activity, index) => (
                <li key={index}>{activity.type} — {activity.minutes} minutes, {activity.points} points</li>
              ))}
            </ul>
          )
        )}
      </div>
    </section>
  );
}
