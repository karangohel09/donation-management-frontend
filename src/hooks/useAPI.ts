import { useState, useEffect } from 'react';

export interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAPI<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
): APIState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        
        if (isMounted) {
          setData(response.data.data || response.data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.error?.message || err.message || 'An error occurred');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}
