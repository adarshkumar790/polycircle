'use client';

import { useEffect, useState } from 'react';
import { getUserIdCounter } from '../registerUser';
import { useRegister } from '../usehooks/usehook';

export function useUserIdCounter() {
  const { signer } = useRegister();
  const [count, setCount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signer) return;

    const fetchCount = async () => {
      setLoading(true);
      const { count, error } = await getUserIdCounter(signer);
      if (error) setError(error);
      else setCount(count);
      setLoading(false);
    };

    fetchCount();
  }, [signer]);

  return { count, loading, error };
}
