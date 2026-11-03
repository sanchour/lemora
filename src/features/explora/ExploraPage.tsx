import { interpolate } from '@/core/i18n/messages';
import { useUi } from '@/design/i18n/UiText';
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useApp } from '@/app/context';
import { PageHeader } from '@/app/PageHeader';
import { getLanguage } from '@/core/lang/languages';
import { ExploreAll } from '@/features/explora/ExploreAll';
import { useGuide } from '@/features/mundus/useGuide';

/**
 * Explora: the discovery room where you find new books, articles, podcasts, audiobooks, series,
 * films, radio stations and vocabulary decks for your active language.
 */
export default function ExploraPage() {
  const translateUi = useUi();
  const { language } = useApp();
  const lang = language.id;
  const langName = getLanguage(lang)?.name ?? lang;
  const guide = useGuide();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  return (
    <>
      <PageHeader
        title={translateUi('Explora')}
        englishTitle={'Explora'}
        eyebrow={translateUi('Discover content for your {0} tools · {1}', [
          translateUi(langName),
          language.level,
        ])}
        englishEyebrow={interpolate('Discover content for your {0} tools · {1}', [
          langName,
          language.level,
        ])}
        actions={
          <div className="relative flex items-center">
            <AnimatePresence initial={false} mode="wait">
              {searchOpen ? (
                <motion.div
                  key="open"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                  className="flex items-center gap-2 rounded-full border border-line bg-raised px-3.5 py-1.5 shadow-sm"
                >
                  <Search size={15} className="text-ink-faint shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={translateUi('Search Explora...')}
                    className="w-44 sm:w-64 bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      aria-label={translateUi('Clear search')}
                      onClick={() => setSearchQuery('')}
                      className="grid size-6 place-items-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink active:scale-90 transition-all"
                    >
                      <X size={13} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={translateUi('Close search')}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="grid size-6 place-items-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink active:scale-90 transition-all"
                    >
                      <X size={13} />
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="closed"
                  type="button"
                  aria-label={translateUi('Search Explora')}
                  title={translateUi('Search titles, authors, decks')}
                  onClick={() => setSearchOpen(true)}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid size-10 place-items-center rounded-full border border-line/70 bg-surface/70 text-ink-soft hover:bg-surface hover:text-ink hover:border-line-strong hover:scale-105 active:scale-95 transition-all shadow-xs"
                >
                  <Search size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {guide === undefined ? (
        <div className="h-96" />
      ) : (
        <ExploreAll
          lang={lang}
          picks={guide.picks}
          level={language.level}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
    </>
  );
}
