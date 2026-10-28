import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReduceDecoration } from '@/lib/useReduceDecoration';

describe('useReduceDecoration hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-reduce-decoration');
  });

  it('initializes to false when localStorage is empty and prefers-reduced-motion is false', () => {
    const { result } = renderHook(() => useReduceDecoration());
    expect(result.current.reduceDecoration).toBe(false);
    expect(document.documentElement.getAttribute('data-reduce-decoration')).toBeNull();
  });

  it('toggles decoration and synchronizes with localStorage and document attribute', () => {
    const { result } = renderHook(() => useReduceDecoration());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.reduceDecoration).toBe(true);
    expect(localStorage.getItem('occasio_reduce_decoration')).toBe('true');
    expect(document.documentElement.getAttribute('data-reduce-decoration')).toBe('true');

    act(() => {
      result.current.toggle();
    });

    expect(result.current.reduceDecoration).toBe(false);
    expect(localStorage.getItem('occasio_reduce_decoration')).toBe('false');
    expect(document.documentElement.getAttribute('data-reduce-decoration')).toBeNull();
  });

  it('initializes to true when localStorage has saved preference true', () => {
    localStorage.setItem('occasio_reduce_decoration', 'true');
    const { result } = renderHook(() => useReduceDecoration());
    expect(result.current.reduceDecoration).toBe(true);
    expect(document.documentElement.getAttribute('data-reduce-decoration')).toBe('true');
  });
});

