import type { Pick, PickGroup, PickLevel } from '@/core/mundus/types';
import type { RadioStation } from '@/data/types';
import type { PickedArtist } from '@/features/cantus/discover';
import type { LibrivoxHit } from '@/services/sonus/librivox';

export type Kind = PickGroup | 'music' | 'radio' | 'audiobooks' | 'comic' | 'tip';

export type ExploraCategory = 'all' | 'screen' | 'books' | 'articles' | 'comics' | 'audio' | 'music' | 'words' | 'ludus' | 'try' | 'saved';

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
  /** Lemora U4: a picture to show as the cover, where the item has one (a comic's, a shelved book's). */
  cover?: string;
  /** Where the item opens, when it is not a pick (a comic, a tip, a shelved book, the first book). */
  to?: string;
  /** One line about it, shown in the hero. */
  blurb?: string;
}

export interface ShelfDefinition {
  id: string;
  title: string;
  subtitle?: string;
  items: ExploraItem[];
  badge?: string;
  aspect?: 'landscape' | 'poster' | 'square' | 'book';
}
