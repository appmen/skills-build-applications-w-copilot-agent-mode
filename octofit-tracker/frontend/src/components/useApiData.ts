import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type State<T> = { loading: boolean; error: string | null; data: T | null };

export function useApiData<T>(path: string): State<T> {
  const [state, setState] = useState<State<T>>({ loading: true, error: null, data: null });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    getJson<T>(path)
      .then((data) => { if (!cancelled) setState({ loading: false, error: null, data }); })
      .catch((error: unknown) => {
        if (!cancelled) setState({ loading: false, error: error instanceof Error ? error.message : 'Unknown error', data: null });
      });
    return () => { cancelled = true; };
  }, [path]);
  return state;
}
