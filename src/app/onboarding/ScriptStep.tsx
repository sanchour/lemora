import { UiText, useUi } from '@/design/i18n/UiText';
import { motion, useReducedMotion } from 'motion/react';
import { getLanguage } from '@/core/lang/languages';
import type { ScriptKnowledge } from '@/data/types';
import { Hand } from '@/design/drawings';
import type { HandName } from '@/design/drawings';
import { cx } from '@/lib/cx';

/** A few letters of each script, drawn large so the question shows what it is about. */
const SAMPLE: Record<string, string> = {
  Cyrl: 'Аа Бб Жж Яя', Grek: 'Αα Ββ Γγ Ωω', Arab: 'ا ب ت ج', Hebr: 'א ב ג ש', Deva: 'अ क ग न', Kore: '가 나 다 한', Jpan: 'あ い か き',
  Hans: '人 大 口 中', Hant: '人 大 口 書', Geor: 'ა ბ გ დ', Armn: 'Ա Բ Գ Դ', Thai: 'ก ข ค ง', Beng: 'অ আ ক খ', Guru: 'ੳ ਅ ਕ ਖ', Taml: 'அ ஆ க ங',
  Ethi: 'ሀ ለ ሐ መ', Khmr: 'ក ខ គ ឃ', Mymr: 'က ခ ဂ ဃ',
};

const CHOICES: Array<{ id: ScriptKnowledge; title: string; line: string; hand: HandName }> = [
  { id: 'reads', title: 'Yes, I can read it', line: 'Straight to books and words', hand: 'glasses' },
  { id: 'some', title: 'A little', line: 'Some letters still need a look', hand: 'letter' },
  { id: 'new', title: 'Not yet', line: 'We start with the alphabet', hand: 'leaf' },
];

/** Whether a language gets this page: those written in something other than Latin letters. */
export const needsScriptStep = (lang: string | null) => Boolean(lang) && (getLanguage(lang!)?.script ?? 'Latn') !== 'Latn';

/** Lemora U2: for a language in another script, one quiet question, can you read its letters? The answer steers what comes first. */
export function ScriptStep({ lang, value, onValue }: { lang: string; value: ScriptKnowledge | null; onValue: (value: ScriptKnowledge) => void }) {
  const translateUi = useUi();
  const reduce = useReducedMotion();
  const language = getLanguage(lang);
  const sample = SAMPLE[language?.script ?? ''] ?? '';
  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      {sample && (
        <motion.p lang={lang} aria-hidden className="font-serif text-[52px] leading-none tracking-wide text-ink-soft" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          {sample}
        </motion.p>
      )}
      <h1 className="mt-8 font-serif text-[30px] leading-tight font-semibold tracking-tight sm:text-[36px]"><UiText source={'Can you read {0} letters?'} values={[translateUi(language?.name ?? lang)]} /></h1>
      <p className="mt-2 text-[15px] text-ink-soft"><UiText source={'Be honest: it only decides what Lingua shows you first.'} /></p>
      <div role="radiogroup" aria-label={translateUi('Can you read {0} letters?', [translateUi(language?.name ?? lang)])} className="mt-10 grid gap-4 sm:grid-cols-3">
        {CHOICES.map((c, i) => {
          const on = value === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onValue(c.id)}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className={cx('group flex flex-col items-center gap-3 rounded-3xl border px-5 py-7 transition-colors', on ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong')}
            >
              <span className={cx('grid size-16 place-items-center rounded-full transition-transform group-hover:-rotate-6', on ? 'bg-raised' : 'bg-accent-soft')}>
                <Hand name={c.hand} size={34} />
              </span>
              <span className="font-serif text-[18px] font-semibold"><UiText source={c.title} /></span>
              <span className="text-[13px] text-ink-faint"><UiText source={c.line} /></span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
