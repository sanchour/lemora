// Lemora U8: with Settings › Reading › "Study a book's words first" on, a book not started yet opens on a short page
// first: its new words, the most used, as a small deck (made once) to study before reading, or straight to reading.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '@/app/context';
import { deckForText } from '@/data/deckTools';
import { useProgress, useText } from '@/data/library';
import type { Text } from '@/data/types';
import { Hand } from '@/design/drawings';
import { UiText } from '@/design/i18n/UiText';
import { Button } from '@/design/primitives';
import { PRODUCT } from '@/product';
import { lookUpFull } from '@/services/dictionary/fullDict';
import { toast } from '@/state/ui';
import ReaderPage from './ReaderPage';

const skipKey = (id: string) => `${PRODUCT.prefix}.deckFirst.read.${id}`;
const skipped = (id: string | undefined) => {
  try {
    return Boolean(id && localStorage.getItem(skipKey(id)));
  } catch {
    return false;
  }
};

export default function ReaderWithDeckFirst() {
  const { settings } = useApp();
  const { textId } = useParams();
  const text = useText(textId);
  const progress = useProgress(textId);
  const [read, setRead] = useState(() => skipped(textId));
  if (settings.reader.deckFirst !== true || read || !textId) return <ReaderPage />;
  if (text === undefined || progress === undefined) return null;
  if (!text || text.kind === 'comic' || (progress?.percent ?? 0) > 0) return <ReaderPage />;
  const readNow = () => {
    try {
      localStorage.setItem(skipKey(textId), '1');
    } catch {}
    setRead(true);
  };
  return <Gate text={text} onRead={readNow} />;
}

function Gate({ text, onRead }: { text: Text; onRead: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const study = async () => {
    setBusy(true);
    try {
      const made = await deckForText(text.lang, text.id, text.title, async (term) => (await lookUpFull(text.lang, term))?.entries[0]?.senses[0]?.g[0]);
      if (!made) {
        toast('There are no new words to learn in it: happy reading.');
        return onRead();
      }
      navigate(`/thesaurus/study/${made.deckId}`);
    } catch {
      toast('The deck couldn’t be made. Read now, or try again.', { tone: 'error' });
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
      <span className="grid size-20 place-items-center rounded-full bg-accent-soft"><Hand name="cards" size={44} /></span>
      <p lang={text.lang} className="mt-6 text-[12px] font-bold tracking-[0.14em] text-ink-faint uppercase">{text.title}</p>
      <h1 className="mt-2 font-serif text-[32px] leading-tight font-semibold tracking-tight"><UiText source={'Learn its words first?'} /></h1>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft"><UiText source={'The words in it you don’t know yet, the most used first, as a small deck. A few minutes of cards, and the book reads more easily.'} /></p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="accent" size="md" loading={busy} onClick={() => void study()}><UiText source={'Study its words'} /></Button>
        <Button variant="secondary" size="md" onClick={onRead}><UiText source={'Read now'} /></Button>
      </div>
    </div>
  );
}
