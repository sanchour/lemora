// The stories made by hand (6-21 G6): one for each of the six core languages, an escape room at A1. Max makes more (6-6b), and those play here too.
import type { StoryGame } from './story';
import { GENRES } from './storyGenres';

type Texts = { title: string; room: string; note: string; rug: string; window: string; locked: string; win: string; note_: string; key_: string; desk: string; under: string; out: string; door: string; open: string; back: string };

const T: Record<string, Texts> = {
  es: { note_: 'la nota', key_: 'la llave', title: 'La habitación cerrada', room: 'Estás en una habitación pequeña. Hay una mesa, una ventana y una puerta. La puerta está cerrada.', note: 'En la mesa hay una nota. Dice: «La llave está debajo de la alfombra».', rug: 'Miras debajo de la alfombra. ¡Hay una llave pequeña!', window: 'Fuera es de noche. Ves un árbol grande y la luna.', locked: 'Tiras de la puerta. Está cerrada con llave. Necesitas una llave.', win: 'Abres la puerta con la llave. ¡Eres libre!', desk: 'Mirar la mesa', under: 'Mirar debajo de la alfombra', out: 'Mirar por la ventana', door: 'Tirar de la puerta', open: 'Abrir la puerta con la llave', back: 'Volver' },
  fr: { note_: 'le mot', key_: 'la clé', title: 'La chambre fermée', room: 'Vous êtes dans une petite chambre. Il y a une table, une fenêtre et une porte. La porte est fermée.', note: 'Sur la table, il y a un mot. Il dit : « La clé est sous le tapis. »', rug: 'Vous regardez sous le tapis. Il y a une petite clé !', window: 'Dehors, il fait nuit. Vous voyez un grand arbre et la lune.', locked: 'Vous tirez la porte. Elle est fermée à clé. Il vous faut une clé.', win: 'Vous ouvrez la porte avec la clé. Vous êtes libre !', desk: 'Regarder la table', under: 'Regarder sous le tapis', out: 'Regarder par la fenêtre', door: 'Tirer la porte', open: 'Ouvrir la porte avec la clé', back: 'Revenir' },
  de: { note_: 'der Zettel', key_: 'der Schlüssel', title: 'Das verschlossene Zimmer', room: 'Du bist in einem kleinen Zimmer. Es gibt einen Tisch, ein Fenster und eine Tür. Die Tür ist zu.', note: 'Auf dem Tisch liegt ein Zettel. Darauf steht: „Der Schlüssel liegt unter dem Teppich.“', rug: 'Du schaust unter den Teppich. Da ist ein kleiner Schlüssel!', window: 'Draußen ist es Nacht. Du siehst einen großen Baum und den Mond.', locked: 'Du ziehst an der Tür. Sie ist abgeschlossen. Du brauchst einen Schlüssel.', win: 'Du öffnest die Tür mit dem Schlüssel. Du bist frei!', desk: 'Den Tisch ansehen', under: 'Unter den Teppich schauen', out: 'Aus dem Fenster schauen', door: 'An der Tür ziehen', open: 'Die Tür mit dem Schlüssel öffnen', back: 'Zurück' },
  ru: { note_: 'записка', key_: 'ключ', title: 'Запертая комната', room: 'Ты в маленькой комнате. Здесь есть стол, окно и дверь. Дверь закрыта.', note: 'На столе лежит записка. В ней написано: «Ключ под ковром».', rug: 'Ты смотришь под ковёр. Там маленький ключ!', window: 'На улице ночь. Ты видишь большое дерево и луну.', locked: 'Ты тянешь дверь. Она заперта. Тебе нужен ключ.', win: 'Ты открываешь дверь ключом. Ты свободен!', desk: 'Посмотреть на стол', under: 'Посмотреть под ковёр', out: 'Посмотреть в окно', door: 'Потянуть дверь', open: 'Открыть дверь ключом', back: 'Назад' },
  zh: { note_: '纸条', key_: '钥匙', title: '上锁的房间', room: '你在一个小房间里。这里有一张桌子、一扇窗和一扇门。门关着。', note: '桌子上有一张纸条。上面写着：“钥匙在地毯下面。”', rug: '你看地毯下面。那里有一把小钥匙！', window: '外面是晚上。你看到一棵大树和月亮。', locked: '你拉门。门锁着。你需要一把钥匙。', win: '你用钥匙开了门。你自由了！', desk: '看桌子', under: '看地毯下面', out: '看窗外', door: '拉门', open: '用钥匙开门', back: '回去' },
  ar: { note_: 'الورقة', key_: 'المفتاح', title: 'الغرفة المغلقة', room: 'أنت في غرفة صغيرة. فيها طاولة ونافذة وباب. الباب مغلق.', note: 'على الطاولة ورقة. مكتوب فيها: «المفتاح تحت السجادة».', rug: 'تنظر تحت السجادة. هناك مفتاح صغير!', window: 'في الخارج ليل. ترى شجرة كبيرة والقمر.', locked: 'تسحب الباب. إنه مقفل. تحتاج إلى مفتاح.', win: 'تفتح الباب بالمفتاح. أنت حر!', desk: 'انظر إلى الطاولة', under: 'انظر تحت السجادة', out: 'انظر من النافذة', door: 'اسحب الباب', open: 'افتح الباب بالمفتاح', back: 'ارجع' },
};

/** The hand-made stories of a language; none for a language without them. */
export function readyStories(lang: string): StoryGame[] {
  const t = T[lang];
  if (!t) return [];
  const more = GENRES.flatMap((g) => (g.text[lang] ? [{ id: `ready:${lang}:${g.id}`, ...g.build(g.text[lang]) }] : []));
  const back = { label: t.back, to: 'room' };
  return [
    {
      id: `ready:${lang}:room`,
      title: t.title,
      level: 'A1',
      start: 'room',
      items: { note: t.note_, key: t.key_ },
      scenes: {
        room: { text: t.room, choices: [{ label: t.desk, to: 'note' }, { label: t.under, to: 'rug', needs: 'note' }, { label: t.out, to: 'window' }, { label: t.door, to: 'locked' }, { label: t.open, to: 'win', needs: 'key' }] },
        note: { text: t.note, gives: 'note', choices: [back] },
        rug: { text: t.rug, gives: 'key', choices: [back] },
        window: { text: t.window, choices: [back] },
        locked: { text: t.locked, choices: [back] },
        win: { text: t.win, choices: [], end: 'win' },
      },
    },
    ...more,
  ];
}
