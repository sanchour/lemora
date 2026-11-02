import { useEffect, useState } from 'react';
import { eraseEverything } from '@/data/reset';
import { Button, Dialog } from '@/design/primitives';
import { UiText, useUi } from '@/design/i18n/UiText';
import { toast } from '@/state/ui';

/** Leaving this page cancels the pending erase; no deleted credentials are kept afterwards. */
export function EraseCountdown({ onCancel, erase = eraseEverything }: { onCancel: () => void; erase?: () => Promise<void> }) {
  const t = useUi();
  const [remaining, setRemaining] = useState(30);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const deadline = Date.now() + 30_000;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) {
        window.clearInterval(timer); setRunning(true);
        void erase().catch(() => { toast('Erasing failed. Check your local data before trying again.', { tone: 'error' }); onCancel(); });
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [erase, onCancel]);
  return <Dialog open onClose={() => !running && onCancel()} title={t('Erase everything?')} actions={<Button variant="secondary" disabled={running} onClick={onCancel}><UiText source="Undo" /></Button>}>
    <p role="status"><UiText source="Erasing in {0} seconds. Undo or leave this page to cancel. After erasure, recovery requires your backup." values={[remaining]} /></p>
  </Dialog>;
}
