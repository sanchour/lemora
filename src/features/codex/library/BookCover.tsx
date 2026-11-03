import { memo, useEffect, useState } from 'react';
import { blobUrl } from '@/data/library';
import type { CoverOrnament, Text } from '@/data/types';
import { cx } from '@/lib/cx';
import { coverOf } from './covers';

interface BookCoverProps {
  text: Pick<Text, 'id' | 'title' | 'author' | 'coverBlobId' | 'lang' | 'cover' | 'coverUrl'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Load a web cover only near the screen (long shelves). */
  lazy?: boolean;
}

/** Small decorations for designed covers, drawn in the cover's ink colour. */
function Ornament({ kind, place }: { kind: CoverOrnament; place: 'top' | 'middle' }) {
  if (place === 'top') {
    if (kind === 'stars') return <span className="mb-[6%] text-[9px] tracking-[0.4em] opacity-75" aria-hidden>✦ ✦ ✦</span>;
    if (kind === 'moon')
      return (
        <svg viewBox="0 0 24 24" className="mb-[6%] h-[11%] w-auto opacity-80" aria-hidden>
          <path d="M15.5 3.5a8.5 8.5 0 1 0 5 15.4A7 7 0 0 1 15.5 3.5Z" fill="currentColor" />
        </svg>
      );
    return null;
  }
  if (kind === 'sprig')
    return (
      <svg viewBox="0 0 48 16" className="my-[8%] w-2/5 opacity-75" aria-hidden>
        <path d="M2 8h44" stroke="currentColor" strokeWidth="1.2" />
        <path d="M24 8c-3-4-7-5-10-4 2 3 6 5 10 4Zm0 0c3-4 7-5 10-4-2 3-6 5-10 4Zm-8 0c-2-3-5-4-8-3 2 2 5 3 8 3Zm16 0c2-3 5-4 8-3-2 2-5 3-8 3Z" fill="currentColor" />
      </svg>
    );
  if (kind === 'frame') return <span className="my-[8%]" aria-hidden />;
  if (kind === 'stars' || kind === 'moon') return <span className="my-[8%] text-[8px] tracking-[0.5em] opacity-60" aria-hidden>· · ·</span>;
  return <span className="my-[8%] h-px w-1/3 bg-current/40" aria-hidden />;
}

export const BookCover = memo(function BookCover({ text, className, size = 'md', lazy = false }: BookCoverProps) {
  const [url, setUrl] = useState<string | null>(null);
  // A picture on the web that didn't load (offline, or gone): the designed cover instead.
  const [remoteFailed, setRemoteFailed] = useState(false);

  useEffect(() => {
    if (!text.coverBlobId) return setUrl(null);
    let objectUrl: string | null = null;
    let cancelled = false;
    void blobUrl(text.coverBlobId).then((u) => {
      if (cancelled) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      objectUrl = u;
      setUrl(u);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [text.coverBlobId]);

  const { cloth, ornament, binding } = coverOf(text);
  const bindingRadius = binding === 'paperback' ? 'rounded-[3px]' : binding === 'linen' ? 'rounded-[4px]' : 'rounded-[5px]';
  const bindingShadow = binding === 'paperback' ? 'shadow-elev-1' : binding === 'leather' ? 'shadow-elev-3' : 'shadow-elev-2';
  const frame = cx('relative aspect-[2/3] overflow-hidden select-none', bindingRadius, bindingShadow, className);

  const picture = url ?? (text.coverUrl && !remoteFailed ? text.coverUrl : null);
  if (picture) {
    return (
      <div className={frame}>
        <img src={picture} alt="" loading={lazy && !url ? 'lazy' : undefined} className="size-full object-cover" draggable={false} referrerPolicy="no-referrer" onError={url ? undefined : () => setRemoteFailed(true)} onLoad={url ? undefined : (e) => e.currentTarget.naturalWidth < 8 && setRemoteFailed(true)} />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
        {binding !== 'paperback' && (
          <span className="pointer-events-none absolute left-[6.5%] inset-y-0 w-px bg-black/35 shadow-[1px_0_0_rgba(255,255,255,0.14)]" aria-hidden />
        )}
      </div>
    );
  }

  const titleSize = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-[19px]' : 'text-[14px]';

  // Inner frame styling according to binding craft
  const innerFrameBorder =
    binding === 'leather'
      ? 'border border-[#d4af37]/75 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.35)]'
      : binding === 'linen'
        ? 'border border-black/25 shadow-[inset_0_1px_1px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.15)]'
        : 'border border-current/35';

  return (
    <div
      className={frame}
      style={{
        backgroundColor: cloth.bg,
        color: binding === 'leather' ? '#fdf3d0' : cloth.ink,
      }}
    >
      {/* Linen woven cloth texture overlay */}
      {binding === 'linen' && (
        <span
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.14) 2px, rgba(255,255,255,0.14) 4px)',
          }}
          aria-hidden
        />
      )}

      {/* Antiquarian leather patina warmth */}
      {binding === 'leather' && (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-amber-950/20 mix-blend-multiply" aria-hidden />
          {/* Raised horizontal spine ribs / bands */}
          <span className="pointer-events-none absolute left-0 top-[24%] h-[2.5px] w-[7%] bg-white/20 shadow-[0_1px_1px_rgba(0,0,0,0.6)]" aria-hidden />
          <span className="pointer-events-none absolute left-0 top-[50%] h-[2.5px] w-[7%] bg-white/20 shadow-[0_1px_1px_rgba(0,0,0,0.6)]" aria-hidden />
          <span className="pointer-events-none absolute left-0 top-[76%] h-[2.5px] w-[7%] bg-white/20 shadow-[0_1px_1px_rgba(0,0,0,0.6)]" aria-hidden />
        </>
      )}

      {/* Inner panel */}
      <div className={cx('absolute inset-[7%] flex flex-col items-center rounded-[3px] px-[8%] py-[12%] text-center', innerFrameBorder, ornament === 'frame' && 'outline outline-1 outline-offset-[3px] outline-current/25')}>
        <span className="mb-auto text-[9px] font-bold tracking-[0.2em] uppercase opacity-70">{text.lang}</span>
        <Ornament kind={ornament} place="top" />
        <span lang={text.lang} className={cx('line-clamp-4 font-serif leading-tight font-semibold', titleSize, binding === 'leather' && 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]')}>
          {text.title}
        </span>
        <Ornament kind={ornament} place="middle" />
        {text.author && <span className="mt-auto line-clamp-2 text-[9px] font-semibold tracking-[0.12em] uppercase opacity-80">{text.author}</span>}
      </div>

      {/* Spine hinge crease & edge shadow */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
      {binding !== 'paperback' && (
        <span className="pointer-events-none absolute left-[6.5%] inset-y-0 w-px bg-black/35 shadow-[1px_0_0_rgba(255,255,255,0.12)]" aria-hidden />
      )}
      {binding === 'paperback' && (
        <span className="pointer-events-none absolute right-0 inset-y-0 w-[1.5px] bg-white/25" aria-hidden />
      )}
    </div>
  );
});
