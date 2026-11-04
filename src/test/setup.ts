import 'fake-indexeddb/auto';
import { loadCatalogue, UI_LANGUAGES } from '@/core/i18n/messages';

// Tests read the interface in every language, so every catalogue is in before they start.
await Promise.all(UI_LANGUAGES.map(loadCatalogue));
