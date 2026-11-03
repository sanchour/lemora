import type { Media, ReadingProgress, Text } from '@/data/types';

export interface ContinueItem {
  id: string;
  kind: 'text' | 'audio' | 'video';
  to: string;
  room: string;
  title: string;
  authorOrCollection?: string;
  detail: string;
  pct?: number;
  at: number;
  text?: Text;
  progress?: ReadingProgress;
  media?: Media;
  video?: Media;
  leftMs?: number;
}
