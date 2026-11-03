import { useUi } from '@/design/i18n/UiText';
import type { PickLevel } from '@/core/mundus/types';
import { LEVEL_HUE } from '@/core/mundus/explore';
import { cx } from '@/lib/cx';

export function LevelBadge({
  level,
  estimated,
  size = 'md',
  className,
}: {
  level: PickLevel;
  estimated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const translateUi = useUi();

  const sizeClasses = {
    sm: 'h-4.5 px-2 text-[10.5px]',
    md: 'h-5.5 px-2.5 text-[11.5px]',
    lg: 'h-7 px-3 text-[13px]',
  }[size];

  return (
    <span
      title={estimated ? translateUi('About {0} (estimated)', [level]) : translateUi('From {0}', [level])}
      className={cx(
        'inline-flex items-center justify-center rounded-full font-bold text-white tabular-nums select-none shadow-xs transition-transform duration-150',
        sizeClasses,
        className,
      )}
      style={{
        background: LEVEL_HUE[level] ?? '#cf9640',
      }}
    >
      {estimated && <span className="opacity-80 mr-0.5 text-[9.5px]">~</span>}
      {level}
    </span>
  );
}
