import { UiText, useUi } from '@/design/i18n/UiText';
import { Info } from 'lucide-react';
import { APP_VERSION } from '../groups';
import { SettingsSection } from '../SettingsSection';

const CREDITS: Array<[string, string]> = [
  ['Fonts', 'Plus Jakarta Sans, Inter, Literata, Lora, Newsreader, Merriweather, Noto Serif, Atkinson Hyperlegible (SIL Open Font License)'],
  ['Icons', 'Lucide (ISC)'],
  ['Libraries', 'React, React Router, Motion, Dexie, Zustand, JSZip, Floating UI, TipTap, Workbox, PDF.js, Tesseract.js (MIT and Apache 2.0)'],
  ['Dictionaries', 'Wiktionary via kaikki.org (CC BY-SA 4.0), word frequencies from OpenSubtitles via FrequencyWords (CC BY-SA 4.0)'],
  ['Comics', 'Pepper&Carrot by David Revoy, www.peppercarrot.com (CC BY 4.0)'],
  ['Magazine', 'Global Voices, globalvoices.org (CC BY 3.0)'],
  ['Free books', 'Project Gutenberg (public domain), Wikisource and Wikipedia (CC BY-SA)'],
  ['World map', 'Natural Earth (public domain)'],
  ['Voices', 'Piper voices from rhasspy/piper-voices, each under its own licence, downloaded only when chosen'],
  ['Everything in full', 'docs/LICENCES.md in the repository'],
  ['News articles', 'Read on request through Jina Reader (r.jina.ai), which sees only the article’s link'],
];


export function AboutSection() {
  const translateUi = useUi();
  return (
    <SettingsSection id="about" icon={Info} title={translateUi('About Lingua')}>
      <p className="text-sm text-ink-soft"><UiText source={'Lingua {0}. Local-first: your data stays on your devices.'} values={[APP_VERSION]} /></p>
      <dl className="mt-4 space-y-2 text-sm">
        {CREDITS.map(([term, detail]) => (
          <div key={term}>
            <dt className="font-semibold">{term}</dt>
            <dd className="text-ink-soft">{detail}</dd>
          </div>
        ))}
      </dl>
    </SettingsSection>
  );
}
