import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Art } from '@/design/drawings';
import type { ArtName } from '@/design/drawings';

export function EmptyState({
  icon: _icon,
  art = 'empty',
  title,
  children,
  action,
}: {
  icon?: LucideIcon;
  art?: ArtName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      {/* Lemora 3.20: the handbook's empty shelf, drawn by hand, in place of a tile with an icon. */}
      <Art name={art} size={96} className="mb-3 text-ink-soft" />
      <h3 className={title.endsWith('?') ? 'asks font-display text-lg font-semibold' : 'font-display text-lg font-semibold'}>{title}</h3>
      <span className="flourish-quiet mt-3" aria-hidden />
      {children && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
