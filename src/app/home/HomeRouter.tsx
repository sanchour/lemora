import { useApp } from '@/app/context';
import HomePage from '@/features/home/HomePage';
import LemoraHome from './LemoraHome';

/** Lemora's Home: the reading room with its drawn tools (Lingua's right rail, made for Lemora), or the desk if chosen in Settings. */
export default function HomeRouter() {
  const { settings } = useApp();
  return settings.ui.homeLayout === 'desk' ? <LemoraHome /> : <HomePage />;
}
