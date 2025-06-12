import { useCallback, useEffect, useState } from 'react';

export function useFetch<T>(fetchFn: () => Promise<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refetch = useCallback(() => {
    setReloadIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!fetchFn) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchFn();
        setData(response);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, reloadIndex]);

  return { data, loading, error, refetch };
}
