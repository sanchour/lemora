import { useEffect, useState } from 'react';
import { catalogueLoaded, loadCatalogue } from './messages';

/** The interface language to show: `lang` once its catalogue is in, English until then (Lemora 4.3). */
export function useCatalogue(lang: string): string {
  const [, rerender] = useState(0);
  useEffect(() => {
    if (lang === 'en' || catalogueLoaded(lang)) return;
    let alive = true;
    void loadCatalogue(lang).then(() => alive && rerender((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [lang]);
  return lang === 'en' || catalogueLoaded(lang) ? lang : 'en';
}
