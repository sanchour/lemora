export type StudioToolId = 'grammar' | 'sounds' | 'script' | 'typing';

/**
 * Hand-drawn scriptorium duotone icons for the Studio sections in Cursus,
 * matching the authentic hand-drawn duotone aesthetic of the Home screen.
 */
export function StudioDuotoneIcon({ id, className = 'size-9' }: { id: StudioToolId; className?: string }) {
  switch (id) {
    case 'grammar':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 10c6-2 11-1 14 2 3-3 8-4 14-2v24c-6-2-11-1-14 2-3-3-8-4-14-2V10Z" stroke="var(--ink)" fill="var(--surface)" />
          <path d="M24 12v26" stroke="var(--ink)" />
          <path d="M14 17h6M14 22h6M14 27h5" stroke="var(--ink)" strokeWidth={1.8} />
          <path d="M32 10v12l-3-2-3 2V10" stroke="#6b8e78" fill="#6b8e78" fillOpacity={0.3} />
          <path d="M27 25h7M27 30h5" stroke="var(--ink)" strokeWidth={1.8} />
        </svg>
      );
    case 'sounds':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11 20h5l8-6v20l-8-6h-5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" stroke="var(--ink)" fill="var(--surface)" />
          <path d="M28 17.5c2.5 1.8 4 4.1 4 6.5s-1.5 4.7-4 6.5" stroke="var(--accent)" strokeWidth={2.2} />
          <path d="M33.5 13c4.5 3 7 7 7 11s-2.5 8-7 11" stroke="#6b8e78" strokeWidth={2.2} strokeLinecap="round" />
          <circle cx="16" cy="24" r="2.2" fill="var(--accent)" fillOpacity={0.7} stroke="var(--accent)" />
        </svg>
      );
    case 'script':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="7" y="12" width="16" height="24" rx="3.5" stroke="var(--ink)" fill="var(--surface)" />
          <path d="M11 30l4-12 4 12M12.5 25.5h5" stroke="var(--ink)" strokeWidth={2} />
          <rect x="25" y="12" width="16" height="24" rx="3.5" stroke="var(--ink)" fill="var(--surface)" />
          <path d="M37 25c0-3-2-5-4.5-5s-4.5 2-4.5 5 2 5 4.5 5c2 0 3.8-1.2 4.3-3H28" stroke="#6b8e78" strokeWidth={2} fill="#6b8e78" fillOpacity={0.25} />
          <path d="M30.5 7.5l4 3" stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      );
    case 'typing':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="6" y="13" width="36" height="23" rx="4" stroke="var(--ink)" fill="var(--surface)" />
          <rect x="11" y="18" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} fill="#6b8e78" fillOpacity={0.3} />
          <rect x="19" y="18" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} />
          <rect x="27" y="18" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} />
          <rect x="35" y="18" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} />
          <rect x="14" y="25" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} />
          <rect x="22" y="25" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} fill="var(--accent)" fillOpacity={0.3} />
          <rect x="30" y="25" width="5" height="4" rx="1" stroke="var(--ink)" strokeWidth={1.8} />
          <path d="M17 32h14" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
  }
}
