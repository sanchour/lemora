// The handbook's hand (docs/handbook, "Drawings, icons and flags"): one fine line in soft ink, one small thing in
// terracotta, sage for leaves. Built from docs/handbook/icons and docs/handbook/art; the colours follow the theme.
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

interface Drawn {
  box: string;
  stroke: number;
  title: string;
  draw: ReactNode;
}

const HAND = {
  "add": { box: '0 0 48 48', stroke: 2.6, title: "Add: new", draw: <><path d="M9 11Q24 9.5 39 11Q40 24 39 37Q24 38.5 9 37Q8 24 9 11Z" opacity=".6" /><path stroke="var(--accent)" d="M24 15V33M15 24H33" /></> },
  "bell": { box: '0 0 48 48', stroke: 2.6, title: "Bell: a reminder", draw: <><path d="M13 33V22Q13 11.5 24 11.5Q35 11.5 35 22V33L39 37.5H9Z" /><path d="M24 7V11.5" /><path stroke="var(--accent)" d="M19.5 41Q24 45 28.5 41" /></> },
  "bin": { box: '0 0 48 48', stroke: 2.6, title: "Waste basket: delete", draw: <><path d="M12 15L14 40Q24 41.5 34 40L36 15" /><path d="M19 14V9.5H29V14" /><path d="M20 21V34M28 21V34" opacity=".5" /><path stroke="var(--accent)" d="M8 14.5Q24 12.5 40 14.5" /></> },
  "book": { box: '0 0 48 48', stroke: 2.6, title: "Open book: a text to read", draw: <><path d="M24 12Q16 7 5 9.5V37Q16 35 24 40Q32 35 43 37V9.5Q32 7 24 12Z" /><path d="M24 12V40" /><path d="M10 16Q16 15 20 17.5M10 22Q16 21 20 23.5M10 28Q16 27 20 29.5" opacity=".5" /><path stroke="var(--accent)" d="M33 8.5V22L35.5 20L38 22V9" /></> },
  "bookmark": { box: '0 0 48 48', stroke: 2.6, title: "Bookmark: a saved word", draw: <><path d="M14 6.5Q24 5 34 6V42L24 34L14 42.5Z" /><path stroke="var(--accent)" d="M19 13Q24 12 29 13" /><path d="M19 18Q24 17 29 18" opacity=".5" /></> },
  "candle": { box: '0 0 48 48', stroke: 2.6, title: "Candle: a streak", draw: <><path d="M17.5 23Q24 21.5 30.5 23V41Q24 42.5 17.5 41Z" /><path d="M12 41.5Q24 40 36 41.5" /><path d="M24 23V19" /><path stroke="var(--accent)" d="M24 6.5Q32 13 24 19Q16 13 24 6.5Z" /></> },
  "cards": { box: '0 0 48 48', stroke: 2.6, title: "Cards: a deck", draw: <><path d="M19 9Q29 7.5 38 9Q40 9.5 40 12V33Q40 35 38 35" /><path d="M10 15Q10 13.5 12 13.5H30Q32 13.5 32 15.5V40Q32 42 30 42H12Q10 42 10 40Z" /><path stroke="var(--accent)" d="M15 24H27M15 29H24" /></> },
  "clock": { box: '0 0 48 48', stroke: 2.6, title: "Pocket watch: time", draw: <><path d="M24 41.5Q9 41.5 9 26.5Q9 11.5 24 11.5Q39 11.5 39 26.5Q39 41.5 24 41.5Z" /><path d="M21 6H27M24 6V11.5" /><path d="M34 14L37 11" opacity=".6" /><path stroke="var(--accent)" d="M24 27V18.5M24 27L30 30.5" /></> },
  "day": { box: '0 0 48 48', stroke: 2.6, title: "Calendar leaf: a day", draw: <><path d="M8 12Q24 10.5 40 12V40Q24 41.5 8 40Z" /><path d="M8 20Q24 18.5 40 20" /><path d="M16 6.5V14.5M32 6.5V14.5" /><path stroke="var(--accent)" d="M18 31L23 36L31 26" /></> },
  "diary": { box: '0 0 48 48', stroke: 2.6, title: "Journal: Diarium", draw: <><path d="M11 6Q23 5 36 6.5V42Q23 43 11 42Z" /><path d="M17 6V42" /><path d="M22 20Q27 19.5 31 20M22 26Q27 25.5 31 26" opacity=".5" /><path stroke="var(--accent)" d="M29 6V17L31.5 15L34 17V6.5" /></> },
  "flag": { box: '0 0 48 48', stroke: 2.6, title: "Pennant: a goal", draw: <><path d="M12 5V43" /><path stroke="var(--accent)" d="M12 8Q24 6 37 8L31 16.5L37 25Q24 27 12 25" /></> },
  "folder": { box: '0 0 48 48', stroke: 2.6, title: "Folder: a group", draw: <><path d="M6 14Q6 11 9 11H19L23.5 16H39Q42 16 42 19V37Q42 40 39 40H9Q6 40 6 37Z" /><path stroke="var(--accent)" d="M6.5 23Q24 21 41.5 23" /></> },
  "glasses": { box: '0 0 48 48', stroke: 2.6, title: "Spectacles: read closely", draw: <><path d="M5 27Q5 21.5 11 21.5Q18 21.5 19 28Q19.5 35 12 35Q5 35 5 27Z" /><path d="M29 28Q30 21.5 37 21.5Q43 21.5 43 27Q43 35 36 35Q28.5 35 29 28Z" /><path d="M5 25L3 18M43 25L45 18" /><path stroke="var(--accent)" d="M19 25Q24 21 29 25" /></> },
  "globe": { box: '0 0 48 48', stroke: 2.6, title: "Globe: languages", draw: <><path d="M24 6Q42 6 42 24Q42 42 24 42Q6 42 6 24Q6 6 24 6Z" /><path d="M9 16Q24 19 39 16M9 32Q24 29 39 32" opacity=".5" /><path stroke="var(--accent)" d="M24 6Q13 24 24 42M24 6Q35 24 24 42" /></> },
  "help": { box: '0 0 48 48', stroke: 2.6, title: "Speech bubble: help, ask", draw: <><path d="M8 10Q24 8.5 40 10V31Q32 32 27 32L19 40V32Q13 32 8 31Z" /><path stroke="var(--accent)" d="M19.5 18.5Q19.5 14.5 24 14.5Q28.5 14.5 28.5 18.5Q28.5 21.5 24.5 23.5V25" /><circle fill="var(--accent)" stroke="none" cx="24.5" cy="28.5" r="1.2" /></> },
  "keys": { box: '0 0 48 48', stroke: 2.6, title: "Keys: typing", draw: <><path d="M5 15Q24 13.5 43 15V35Q24 36.5 5 35Z" /><path d="M11 21h2M17.5 21h2M24 21h2M30.5 21h2M37 21h2M11 27h2M35 27h2" /><path stroke="var(--accent)" d="M17 30H31" /></> },
  "lamp": { box: '0 0 48 48', stroke: 2.6, title: "Reading lamp: focus, night", draw: <><path d="M15 8Q24 7 33 8L38.5 22Q24 23.5 9.5 22Z" /><path d="M24 23V38" /><path d="M15 41.5Q24 40.5 33 41.5" /><path stroke="var(--accent)" d="M14 28Q24 33 34 28" /></> },
  "leaf": { box: '0 0 48 48', stroke: 2.6, title: "Leaf: a word you know", draw: <><path d="M9 39C7 16 22 8 39 9C40 28 28 40 9 39Z" /><path d="M17 31Q18 25 23 22M24 26Q27 23 28 19" opacity=".5" /><path stroke="var(--accent)" d="M9 39Q22 28 33 15" /></> },
  "letter": { box: '0 0 48 48', stroke: 2.6, title: "Letter: the inbox", draw: <><path d="M5 13Q24 12 43 13V37Q24 38 5 37Z" /><path d="M5.5 14L24 27L42.5 14" /><path stroke="var(--accent)" d="M24 27.5m-3.8 0a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0-7.6 0" /></> },
  "mic": { box: '0 0 48 48', stroke: 2.6, title: "Microphone: speak", draw: <><path d="M19 9Q24 5.5 29 9V22Q24 28 19 22Z" /><path d="M12 21Q11 33 24 33.5Q37 33 36 21" /><path d="M24 34V41M17 41.5Q24 40.5 31 41.5" /><path stroke="var(--accent)" d="M20 14H28M20 19H28" /></> },
  "pause": { box: '0 0 48 48', stroke: 2.6, title: "Pause: hold", draw: <><path d="M14 10Q17.5 9 21 10V38Q17.5 39 14 38Z" /><path stroke="var(--accent)" d="M27 10Q30.5 9 34 10V38Q30.5 39 27 38Z" /></> },
  "play": { box: '0 0 48 48', stroke: 2.6, title: "Play: start", draw: <><path d="M15 9.5Q16 8.5 18 9.5L38 22Q40.5 24 38 26L18 38.5Q15.5 39.5 15 37Z" /><path stroke="var(--accent)" d="M42 17Q45 24 42 31" /></> },
  "quill": { box: '0 0 48 48', stroke: 2.6, title: "Quill: to write", draw: <><path d="M41 7C42 20 33 32 16 35C17 28 24 13 41 7Z" /><path d="M13 38C19 27 28 18 38 11" /><path d="M27 16L23 21M31 22L26 27M22 25L19 29" opacity=".5" /><path stroke="var(--accent)" d="M13 38L8.5 43" /></> },
  "repeat": { box: '0 0 48 48', stroke: 2.6, title: "Repeat: again", draw: <><path d="M9 24V20Q9 12 17 12H37" /><path d="M32 6.5L38 12L32 17.5" /><path d="M39 24V28Q39 36 31 36H11" /><path stroke="var(--accent)" d="M16 30.5L10 36L16 41.5" /></> },
  "seal": { box: '0 0 48 48', stroke: 2.6, title: "Seal: a milestone", draw: <><path d="M24 6Q29 4.5 32 9.5Q38 8.5 38.5 15Q43.5 18.5 40.5 24Q43.5 29.5 38.5 33Q38 39.5 32 38.5Q29 43.5 24 42Q19 43.5 16 38.5Q10 39.5 9.5 33Q4.5 29.5 7.5 24Q4.5 18.5 9.5 15Q10 8.5 16 9.5Q19 4.5 24 6Z" /><path stroke="var(--accent)" d="M17 24.5L22 30L31 19" /></> },
  "search": { box: '0 0 48 48', stroke: 2.6, title: "Magnifier: look up", draw: <><path d="M20 8Q31 7.5 32.5 18.5Q33.5 30 21.5 31.5Q9 33 8 21Q7 9.5 20 8Z" /><path d="M30 30L41 41.5" /><path stroke="var(--accent)" d="M13.5 16Q15.5 12.5 19.5 12" /></> },
  "share": { box: '0 0 48 48', stroke: 2.6, title: "Paper plane: send, share", draw: <><path d="M6 22L42 6L34 42L24 30Z" /><path d="M24 30L42 6" /><path stroke="var(--accent)" d="M6 35Q12 31 17 36" /></> },
  "sound": { box: '0 0 48 48', stroke: 2.6, title: "Sound: listen", draw: <><path d="M7 19Q11 18 15 19L24 11V37L15 29Q11 30 7 29Z" /><path stroke="var(--accent)" d="M30 18Q34.5 24 30 30M35 13Q43.5 24 35 35" /></> },
  "stack": { box: '0 0 48 48', stroke: 2.6, title: "Stack of books: the library", draw: <><path d="M6.5 34Q24 33.5 42 34V42Q24 42.5 6.5 42Z" /><path d="M10 34V26Q26 25.5 39 26V34" /><path d="M13 26L16 18.5Q26 19.5 36 21.5L35 26" /><path d="M12 38H29" opacity=".5" /><path stroke="var(--accent)" d="M34 34V42" /></> },
  "tag": { box: '0 0 48 48', stroke: 2.6, title: "Tag: a label", draw: <><path d="M7 24V10Q7 8 9 8H24Q26 8 28 10L40 22Q42 24 40 26L26 40Q24 42 22 40L9 27Q7 25 7 24Z" /><path stroke="var(--accent)" d="M16.5 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" /></> },
  "talk": { box: '0 0 48 48', stroke: 2.6, title: "Two bubbles: conversation", draw: <><path d="M26 8H41Q43 8 43 10V24Q43 26 41 26H38V32L32 26H27" opacity=".55" /><path d="M5 17H29Q31 17 31 19V35Q31 37 29 37H18L11 43V37H5Q3 37 3 35V19Q3 17 5 17Z" /><circle fill="var(--accent)" stroke="none" cx="11" cy="27" r="1.2" /><circle fill="var(--accent)" stroke="none" cx="17" cy="27" r="1.2" /><circle fill="var(--accent)" stroke="none" cx="23" cy="27" r="1.2" /></> },
  "tray": { box: '0 0 48 48', stroke: 2.6, title: "Tray: save to the device", draw: <><path d="M8 28V38Q24 40 40 38V28" /><path stroke="var(--accent)" d="M24 8V29M16 22L24 30L32 22" /></> },
  "undo": { box: '0 0 48 48', stroke: 2.6, title: "Undo: take it back", draw: <><path d="M12 19H27Q38 19 38 29Q38 39 27 39H17" /><path stroke="var(--accent)" d="M18 11L10 19L18 27" /></> },
} satisfies Record<string, Drawn>;

const ART = {
  "done": { box: '0 0 96 96', stroke: 2.4, title: "All done for today: a closed book and a cup", draw: <><path d="M12 72Q48 70.5 84 72V84Q48 85.5 12 84Z" /><path d="M19 72V84" /><path d="M26 80H72" opacity=".5" /><path d="M34 54H62V62Q62 70 48 70Q34 70 34 62Z" /><path d="M62 57Q72 56 70 63Q68 67 61 66" /><path stroke="var(--accent)" d="M42 48Q38 42 43 37Q47 32 43 27" /><path stroke="var(--accent)" d="M52 48Q48 43 53 38" /></> },
  "empty": { box: '0 0 96 96', stroke: 2.4, title: "Nothing here yet: an empty shelf with a place held", draw: <><path d="M8 74Q48 72.5 88 74" /><path d="M10 74V79Q48 80.5 86 79V74" /><path d="M16 74V40Q20 39 24 40V74" /><path d="M27 74V33Q32 32 36 33V74" /><path d="M38 74L41 38Q45 37 48 38.5L45 74" /><path d="M72 74V44Q76 43 80 44V74" /><path stroke="var(--accent)" strokeDasharray="2.2 3.4" d="M52 74V46Q58 45 64 46V74" /><path stroke="var(--sage)" d="M60 74Q60 68 64 64" /></> },
  "error": { box: '0 0 96 96', stroke: 2.4, title: "Something tore: a page torn across", draw: <><path d="M24 12H72V50L65 44L58 52L50 44L42 52L34 45L24 52Z" /><path d="M32 22H60M32 30H54M32 38H58" opacity=".5" /><path d="M24 62L34 55L42 63L50 55L58 63L65 56L72 62V84H24Z" /><path d="M32 72H58M32 78H50" opacity=".5" /><path stroke="var(--accent)" d="M16 57H22M74 57H80" /></> },
  "offline": { box: '0 0 96 96', stroke: 2.4, title: "No connection: a lamp whose plug has come out", draw: <><path d="M28 20Q48 18 68 20L76 42Q48 45 20 42Z" /><path d="M48 44V70" /><path d="M34 76Q48 74 62 76" /><path d="M48 70Q48 86 60 86" /><path stroke="var(--accent)" d="M60 82H68V90H60Z" /><path d="M78 80H88V92H78Z" /><path stroke="var(--accent)" d="M71 83L74 80L73 85L76 83" /></> },
  "search": { box: '0 0 96 96', stroke: 2.4, title: "No results: a page and a lens that found nothing", draw: <><path d="M24 12H56L70 26V74Q47 76 24 74Z" /><path d="M56 12V26H70" /><path d="M32 38H60M32 46H54M32 54H44" opacity=".5" /><path fill="#fffbf4" d="M50 58Q64 56 66 70Q68 84 54 86Q40 88 38 74Q36 60 50 58Z" /><path d="M63 82L80 90" /><path stroke="var(--accent)" d="M44 68Q45 64 50 63" /></> },
  "welcome": { box: '0 0 96 96', stroke: 2.4, title: "First start: a stack of books, a sprig, a ribbon", draw: <><path d="M14 76Q48 74.5 82 76V86Q48 87.5 14 86Z" /><path d="M20 76V86" /><path d="M20 62Q50 60.5 80 62V74Q50 75.5 20 74Z" /><path d="M26 68H46" opacity=".5" /><path d="M28 46Q52 44 74 47V60Q50 61.5 28 59Z" transform="rotate(-3 50 52)" /><path d="M34 52H52" opacity=".5" /><path stroke="var(--sage)" d="M52 44Q50 34 56 26" /><path stroke="var(--sage)" d="M56 26Q64 24 66 18Q58 18 56 26Z" /><path stroke="var(--sage)" d="M52 36Q44 35 41 29Q49 29 52 36Z" /><path stroke="var(--accent)" d="M70 86V92L73 89.5L76 92V86.4" /></> },
} satisfies Record<string, Drawn>;

export type HandName = keyof typeof HAND;
export type ArtName = keyof typeof ART;

function Svg({ d, size, className, label }: { d: Drawn; size: number; className?: string; label?: string }) {
  return (
    <svg viewBox={d.box} width={size} height={size} className={cx('shrink-0 text-ink-soft', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <g fill="none" stroke="currentColor" strokeWidth={d.stroke} strokeLinecap="round" strokeLinejoin="round">
        {d.draw}
      </g>
    </svg>
  );
}

/** A small drawn icon (48 box), for headings and empty corners; Lucide stays the room icons. */
export function Hand({ name, size = 28, className, label }: { name: HandName; size?: number; className?: string; label?: string }) {
  return <Svg d={HAND[name]} size={size} className={className} label={label} />;
}

/** An empty page's drawing (96 box): only where a page has nothing else to show. */
export function Art({ name, size = 96, className, label }: { name: ArtName; size?: number; className?: string; label?: string }) {
  return <Svg d={ART[name]} size={size} className={className} label={label} />;
}
