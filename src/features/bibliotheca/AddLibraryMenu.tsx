import { memo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookHeadphones,
  BookOpen,
  Captions,
  Clapperboard,
  ClipboardPaste,
  FileAudio,
  Film,
  Headphones,
  Layers,
  Library,
  Link2,
  Music2,
  Newspaper,
  PanelsTopLeft,
  Plus,
  Rss,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUi, UiText } from '@/design/i18n/UiText';
import { useLayout } from '@/design/hooks/useLayout';
import { Button, Drawer, Popover } from '@/design/primitives';
import { pickFiles } from '@/services/files/files';
import { AUDIO_ACCEPT, importAudioFiles } from '@/services/sonus/files';
import { subscribe } from '@/services/sonus/podcasts';
import { parseSpotifyLink, spotifyInfo } from '@/services/sonus/spotify';
import { addSpotify } from '@/data/media';
import { addVideoFiles } from '@/features/visio/library/AddVideoMenu';
import { addVideoLink, importSubtitlesOnly, SUBTITLE_ACCEPT } from '@/services/visio/files';
import { AddBookDrawer } from '@/features/sonus/library/AddBookDrawer';
import { sonusBase } from '@/features/sonus/paths';
import { toast } from '@/state/ui';

interface AddOption {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  action: () => void | Promise<void>;
}

interface AddSection {
  id: string;
  tool: string;
  roomIcon: LucideIcon;
  roomColor: string;
  options: AddOption[];
}

export const AddLibraryMenu = memo(function AddLibraryMenu({ lang }: { lang: string }) {
  const translateUi = useUi();
  const { layout } = useLayout();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState(false);
  const [audioLink, setAudioLink] = useState<'feed' | 'spotify' | null>(null);
  const [book, setBook] = useState(false);
  const [videoLink, setVideoLink] = useState(false);
  const [busy, setBusy] = useState(false);

  const openVideo = (id: string) => navigate(`/visio/watch/${id}`);

  const handleAudioFiles = async () => {
    const files = await pickFiles(AUDIO_ACCEPT);
    if (!files.length) return;
    setBusy(true);
    try {
      const { ids, skipped } = await importAudioFiles(lang, files);
      if (skipped.length) {
        toast(
          {
            source: '{0} audio this device can play.',
            values: [
              skipped.length === 1
                ? { source: '“{0}” isn’t', values: [String(skipped[0])] }
                : { source: '{0} files aren’t', values: [String(skipped.length)] },
            ],
          },
          { tone: 'error' },
        );
      }
      if (ids.length === 1) navigate(`${sonusBase()}/play/${ids[0]}`);
      else if (ids.length) toast({ source: '{0} files added.', values: [String(ids.length)] }, { tone: 'success' });
    } finally {
      setBusy(false);
    }
  };

  const handleSubtitlesOnly = async () => {
    const files = await pickFiles(SUBTITLE_ACCEPT);
    if (!files.length) return;
    setBusy(true);
    try {
      const { ids, skipped } = await importSubtitlesOnly(lang, files);
      if (skipped.length) {
        toast(
          { source: '{0} couldn’t be read as subtitles.', values: [String(skipped.length)] },
          { tone: 'error' },
        );
      }
      if (ids.length === 1) openVideo(ids[0]);
      else if (ids.length) toast({ source: '{0} added.', values: [String(ids.length)] }, { tone: 'success' });
    } finally {
      setBusy(false);
    }
  };

  const sections: AddSection[] = [
    {
      id: 'codex',
      tool: 'Codex',
      roomIcon: BookOpen,
      roomColor: 'text-amber-500',
      options: [
        {
          id: 'codex-book',
          icon: BookOpen,
          title: 'Book or document',
          detail: 'Import an EPUB, PDF, or text file',
          action: () => navigate('/codex/new?way=book'),
        },
        {
          id: 'codex-write',
          icon: ClipboardPaste,
          title: 'Write or paste',
          detail: 'Paste an article or draft a story',
          action: () => navigate('/codex/new?way=write'),
        },
        {
          id: 'codex-comic',
          icon: PanelsTopLeft,
          title: 'Comic or manga',
          detail: 'CBZ, CBR, or image folders',
          action: () => navigate('/codex/new?way=comic'),
        },
        {
          id: 'codex-news',
          icon: Newspaper,
          title: 'News & Wikipedia',
          detail: 'Read today’s articles in your language',
          action: () => navigate('/codex/new?way=news'),
        },
        {
          id: 'codex-goodreads',
          icon: Library,
          title: 'Goodreads shelves',
          detail: 'Import books from your reading lists',
          action: () => navigate('/codex/new?way=goodreads'),
        },
      ],
    },
    {
      id: 'sonus',
      tool: 'Sonus',
      roomIcon: Headphones,
      roomColor: 'text-emerald-500',
      options: [
        {
          id: 'sonus-files',
          icon: FileAudio,
          title: 'Audio files',
          detail: 'MP3, M4A, podcasts, and recordings',
          action: () => void handleAudioFiles(),
        },
        {
          id: 'sonus-book',
          icon: BookHeadphones,
          title: 'Audiobook or course',
          detail: 'Folder or multi-part audio with chapters',
          action: () => setBook(true),
        },
        {
          id: 'sonus-feed',
          icon: Rss,
          title: 'Podcast by RSS',
          detail: 'Follow any show by its feed link',
          action: () => setAudioLink('feed'),
        },
        {
          id: 'sonus-spotify',
          icon: Music2,
          title: 'Spotify link',
          detail: 'Episodes, shows, and playlists',
          action: () => setAudioLink('spotify'),
        },
      ],
    },
    {
      id: 'visio',
      tool: 'Visio',
      roomIcon: Clapperboard,
      roomColor: 'text-sky-500',
      options: [
        {
          id: 'visio-files',
          icon: Film,
          title: 'Video files',
          detail: 'MP4, WebM, MOV with subtitles',
          action: () => void addVideoFiles(lang, openVideo),
        },
        {
          id: 'visio-link',
          icon: Link2,
          title: 'Video link',
          detail: 'A YouTube video or web video stream',
          action: () => setVideoLink(true),
        },
        {
          id: 'visio-subtitles',
          icon: Captions,
          title: 'Subtitles only',
          detail: 'Load SRT or VTT for external shows',
          action: () => void handleSubtitlesOnly(),
        },
      ],
    },
    {
      id: 'thesaurus',
      tool: 'Thesaurus',
      roomIcon: Layers,
      roomColor: 'text-purple-500',
      options: [
        {
          id: 'thesaurus-decks',
          icon: Layers,
          title: 'Vocabulary deck',
          detail: 'Top frequency lists and themed decks',
          action: () => navigate('/thesaurus?tab=discover'),
        },
      ],
    },
  ];

  const renderContent = (close: () => void) => (
    <div className="max-h-[80vh] overflow-y-auto px-1 py-1 [scrollbar-width:thin]">
      <div className="border-b border-line/60 px-3 py-2">
        <p className="font-serif text-[16px] font-semibold text-ink">
          <UiText source={'Add to your library'} />
        </p>
      </div>

      <div className="space-y-3 p-1">
        {sections.map((section) => {
          const RoomIcon = section.roomIcon;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
                <RoomIcon size={12} className={section.roomColor} aria-hidden />
                <span>{section.tool}</span>
              </div>
              <ul className="space-y-0.5">
                {section.options.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          void opt.action();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-raised active:bg-sunken"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sunken text-ink-soft">
                          <Icon size={16} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold text-ink">
                            {opt.title}
                          </span>
                          <span className="block truncate text-[12px] text-ink-soft">
                            {opt.detail}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {layout === 'wide' ? (
        <Popover
          label={translateUi('Add to your library')}
          placement="bottom-end"
          className="w-[380px] p-0"
          trigger={(props) => (
            <Button {...props} variant="primary" icon={Plus} loading={busy}>
              <UiText source={'Add'} />
            </Button>
          )}
        >
          {(close) => renderContent(close)}
        </Popover>
      ) : (
        <>
          <Button variant="primary" icon={Plus} loading={busy} onClick={() => setSheet(true)}>
            <UiText source={'Add'} />
          </Button>
          <Drawer open={sheet} onClose={() => setSheet(false)} title={translateUi('Add to your library')}>
            {renderContent(() => setSheet(false))}
          </Drawer>
        </>
      )}

      {/* Auxiliary Input Drawers for Audio and Video links */}
      <AudioLinkDrawer lang={lang} kind={audioLink} onClose={() => setAudioLink(null)} />
      <AddBookDrawer lang={lang} open={book} onClose={() => setBook(false)} />
      <VideoLinkDrawer lang={lang} open={videoLink} onClose={() => setVideoLink(false)} onAdded={openVideo} />
    </>
  );
});

function AudioLinkDrawer({
  lang,
  kind,
  onClose,
}: {
  lang: string;
  kind: 'feed' | 'spotify' | null;
  onClose: () => void;
}) {
  const translateUi = useUi();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const spotify = kind === 'spotify';

  const save = async () => {
    setBusy(true);
    try {
      if (spotify) {
        const parsed = parseSpotifyLink(value);
        if (!parsed) throw new Error('That isn’t a Spotify episode, show, playlist or track link.');
        const info = await spotifyInfo(parsed);
        const id = await addSpotify(lang, parsed, info);
        navigate(`${sonusBase()}/play/${id}`);
      } else {
        const id = await subscribe(lang, value);
        navigate(`${sonusBase()}/podcast/${id}`);
      }
      setValue('');
      onClose();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That link couldn’t be added.', {
        tone: 'error',
        duration: 7000,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={kind !== null}
      onClose={onClose}
      title={spotify ? translateUi('Add a Spotify link') : translateUi('Follow a podcast')}
      description={
        spotify
          ? translateUi('Spotify plays in its own player here. Its audio can’t be downloaded or transcribed, but a transcript file you add will follow along.')
          : translateUi('Paste the show’s RSS address. Episodes stream, can be saved offline, and can be transcribed.')
      }
      footer={
        <Button block size="lg" onClick={() => void save()} loading={busy} disabled={!value.trim()}>
          {spotify ? translateUi('Add') : translateUi('Follow')}
        </Button>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold tracking-wide text-ink-soft uppercase">
          {spotify ? translateUi('Link') : translateUi('RSS address')}
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && void save()}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={spotify ? translateUi('https://open.spotify.com/episode/…') : translateUi('https://…/feed.xml')}
          data-autofocus
          className="h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-[15px]"
        />
      </label>
    </Drawer>
  );
}

function VideoLinkDrawer({
  lang,
  open,
  onClose,
  onAdded,
}: {
  lang: string;
  open: boolean;
  onClose: () => void;
  onAdded: (id: string) => void;
}) {
  const translateUi = useUi();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const id = await addVideoLink(lang, url, title);
      setUrl('');
      setTitle('');
      onClose();
      onAdded(id);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'That link couldn’t be added.', {
        tone: 'error',
        duration: 8000,
      });
    } finally {
      setBusy(false);
    }
  };

  const field = 'h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-[15px]';
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={translateUi('Add a video link')}
      description={translateUi(
        'A YouTube link plays here with two subtitle lines once you add subtitles. A direct link to a video file (.mp4, .webm) streams the same way. Other streaming services can’t be played inside Lingua; add their subtitles instead and follow along.',
      )}
      footer={
        <Button block size="lg" onClick={() => void save()} loading={busy} disabled={!url.trim()}>
          <UiText source={'Add'} />
        </Button>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-bold tracking-wide text-ink-soft uppercase">
          <UiText source={'Link'} />
        </span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && url.trim() && void save()}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={translateUi('https://youtu.be/… or https://…/episode.mp4')}
          data-autofocus
          className={field}
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-bold tracking-wide text-ink-soft uppercase">
          <UiText source={'Title (optional)'} />
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
      </label>
    </Drawer>
  );
}
