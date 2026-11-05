// Small pieces the Home styles share.
import { Link } from 'react-router';
import { UiText } from '@/design/i18n/UiText';
import { BookCover } from '@/features/codex/library/BookCover';
import type { WhatNextItem } from '../homeData';
import type { HomeFacts } from './useHomeFacts';

/** A What-next item's words: its title and detail are translated unless they are made of the learner's own (a book, a deck). */
export function nextIsLiteral(item: WhatNextItem) {
  return item.id.startsWith('tip:') || item.id.startsWith('next:') || item.title.startsWith('Review ') || item.title.startsWith('Read “') || item.title.startsWith('The next ');
}
export function NextTitle({ item }: { item: WhatNextItem }) {
  return nextIsLiteral(item) ? <>{item.title}</> : <UiText source={item.title} />;
}
export function NextDetail({ item }: { item: WhatNextItem }) {
  return item.id.startsWith('tip:') || item.id.startsWith('next:') ? <>{item.detail}</> : <UiText source={item.detail} />;
}

/** The book being read as a cover: the real one, or a drawn one for the starter text. */
export function LeftOffCover({ facts, className }: { facts: HomeFacts; className?: string }) {
  const { leftOff, language } = facts;
  return <BookCover text={leftOff.book ?? { id: 'starter', title: leftOff.title, author: leftOff.author, lang: language.id }} className={className ?? 'size-full object-cover'} />;
}

/** "12 min", with the learner's goal. */
export function Minutes({ n }: { n: number }) {
  return <UiText source={'{0} min'} values={[n]} />;
}

/** The link a style uses for "carry on": the book if there is one, else the way to find one. */
export function ContinueLink({ facts, className, children }: { facts: HomeFacts; className?: string; children: React.ReactNode }) {
  return <Link to={facts.leftOff.to} className={className}>{children}</Link>;
}

/** Seven small bars for the week's minutes (the last is today). */
export function WeekBars({ week, goal, className = 'h-10' }: { week: HomeFacts['week']; goal: number; className?: string }) {
  const top = Math.max(goal, ...week.map((d) => d.minutes), 1);
  return (
    <span className={`flex items-end gap-1 ${className}`} aria-hidden>
      {week.map((d, i) => (
        <span key={d.date} className="flex h-full flex-1 items-end">
          <span className={`block w-full rounded-sm ${i === week.length - 1 ? 'bg-accent' : d.minutes > 0 ? 'bg-accent/45' : 'bg-line'}`} style={{ height: `${Math.max(8, (d.minutes / top) * 100)}%` }} />
        </span>
      ))}
    </span>
  );
}
