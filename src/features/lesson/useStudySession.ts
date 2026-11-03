import { useEffect } from 'react';
import { recordSession } from '@/data/activity';
import type { ActivitySession } from '@/data/types';

const IDLE_AFTER_MS = 90_000;

/**
 * Records the time spent on a page that has no clock of its own (Ludus's games, practice sets): time while the tab is
 * visible and the learner did something in the last minute and a half. It is recorded when the page closes or the
 * app goes to the background, like a reading session (codex/reader/useReadingSession).
 */
export function useStudySession(lang: string, type: ActivitySession['type'], refId?: string) {
  useEffect(() => {
    let startedAt = Date.now();
    let active = 0;
    let lastTick = performance.now();
    let lastInput = performance.now();
    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === 'visible' && now - lastInput < IDLE_AFTER_MS) active += Math.min(now - lastTick, IDLE_AFTER_MS);
      lastTick = now;
    };
    const flush = () => {
      tick();
      if (active >= 5_000) void recordSession({ lang, type, refId, startedAt, endedAt: Date.now(), activeMs: Math.round(active) });
      startedAt = Date.now();
      active = 0;
    };
    const input = () => {
      tick();
      lastInput = performance.now();
    };
    const onVisibility = () => (document.visibilityState === 'hidden' ? flush() : (lastTick = performance.now()));
    const interval = window.setInterval(tick, 15_000);
    window.addEventListener('pointerdown', input, { passive: true });
    window.addEventListener('keydown', input);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      flush();
      window.clearInterval(interval);
      window.removeEventListener('pointerdown', input);
      window.removeEventListener('keydown', input);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [lang, type, refId]);
}
