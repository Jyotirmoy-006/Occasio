'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HealthResponse } from '@/app/api/health/route';

const FALLBACK_HEALTH: HealthResponse = {
  status: 'ok',
  demoMode: true,
  aiStatus: 'unavailable_network_error',
  label: 'AI unavailable: network error',
  tooltip: 'Could not contact health check endpoint. Running on demo engine.',
  model: null,
  timestamp: new Date().toISOString(),
};

export function useAiHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const fetchHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth(FALLBACK_HEALTH);
      }
    } catch {
      setHealth(FALLBACK_HEALTH);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const check = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok && !ignore) {
          const data = await res.json();
          setHealth(data);
        }
      } catch {
        if (!ignore) {
          setHealth(FALLBACK_HEALTH);
        }
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return { health, isCheckingHealth, recheckHealth: fetchHealth };
}
