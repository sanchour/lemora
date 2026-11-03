import type { Pick, PickGroup, PickLevel } from '@/core/mundus/types';
import type { RadioStation } from '@/data/types';
import type { PickedArtist } from '@/features/cantus/discover';
import type { LibrivoxHit } from '@/services/sonus/librivox';

export type Kind = PickGroup | 'music' | 'radio' | 'audiobooks';

export type ExploraCategory = 'all' | 'screen' | 'books' | 'audio' | 'music' | 'words' | 'try' | 'saved';

export interface ExploraItem {
  id: string;
  kind: Kind;
  title: string;
  sub?: string;
  level: PickLevel;
  estimated?: boolean;
  pick?: Pick;
  artist?: PickedArtist;
  station?: RadioStation;
  book?: LibrivoxHit;
}

export interface ShelfDefinition {
  id: string;
  title: string;
  subtitle?: string;
  items: ExploraItem[];
  badge?: string;
  aspect?: 'landscape' | 'poster' | 'square' | 'book';
}
