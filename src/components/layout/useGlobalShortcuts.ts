'use client';

import { useEffect } from 'react';

function isTargetEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function handleUndoRedo(
  e: KeyboardEvent,
  canUndo: boolean,
  canRedo: boolean,
  undo: () => void,
  redo: () => void,
) {
  if (e.shiftKey) {
    if (canRedo) {
      e.preventDefault();
      redo();
    }
  } else if (canUndo) {
    e.preventDefault();
    undo();
  }
}

interface ShortcutHandlers {
  onToggleShortcuts: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useGlobalShortcuts({
  onToggleShortcuts,
  undo,
  redo,
  canUndo,
  canRedo,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const isEditable = isTargetEditable(e.target);

      if (isCmdOrCtrl && key === 'k') {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      if (key === '?' && !isEditable) {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      if (isCmdOrCtrl && key === 'z' && !isEditable) {
        handleUndoRedo(e, canUndo, canRedo, undo, redo);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, onToggleShortcuts]);
}
