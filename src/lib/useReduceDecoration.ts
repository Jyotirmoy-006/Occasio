'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'occasio_reduce_decoration';

export function useReduceDecoration() {
  const [reduceDecoration, setReduceDecoration] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === 'true';
      return (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        window.matchMedia('(prefers-contrast: more)').matches
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (reduceDecoration) {
      document.documentElement.setAttribute('data-reduce-decoration', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduce-decoration');
    }
  }, [reduceDecoration]);

  const toggle = useCallback(() => {
    setReduceDecoration((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // quota ignore
      }
      return next;
    });
  }, []);

  return { reduceDecoration, toggle };
}
