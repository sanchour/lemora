// Finish it (6-21, F1203 and F1204): a dialogue with a line missing, or a story without its ending, and three lines to choose from. Hand-made for the
// six core languages, so it needs no key; Practice has the same with Max for any language. Pure.
export interface CompleteItem {
  kind: 'dialogue' | 'story';
  /** What comes before the gap, and after it (a dialogue only). */
  before: string;
  after?: string;
  /** The line that fits, then two that do not. */
  options: [string, string, string];
}

export interface CompleteRound {
  item: CompleteItem;
  options: string[];
  answer: number;
}

// Each language: three dialogues as [before, after, fits, wrong, wrong], then three stories as [text, fits, wrong, wrong].
const T: Record<string, string[][]> = {
  es: [
    ['A: ¡Hola! ¿Cómo estás?', 'A: Yo también estoy bien. Gracias.', 'B: Estoy bien, gracias. ¿Y tú?', 'B: Tengo veinte años.', 'B: Está encima de la mesa.'],
    ['A: Buenas noches. Una mesa para dos, por favor.', 'A: Junto a la ventana, por favor.', 'B: Por supuesto. ¿Dónde quiere sentarse?', 'B: Cuesta cinco euros.', 'B: Me gusta mi gato.'],
    ['A: Perdone, ¿dónde está la estación?', 'A: ¡Muchas gracias!', 'B: Siga recto y gire a la izquierda.', 'B: Tengo un coche rojo.', 'B: Son las nueve.'],
    ['Ana tiene hambre. Va a la cocina y abre la nevera.', 'Hace un sándwich y se lo come.', 'Se pone el abrigo y se va a nadar.', 'Le canta una canción a la nevera.'],
    ['Llueve. Tom no tiene paraguas.', 'Compra un paraguas en la tienda.', 'Apaga el sol.', 'Le lee un libro a la lluvia.'],
    ['Lena tiene un examen mañana. Está nerviosa.', 'Estudia dos horas y se acuesta temprano.', 'Mete el examen en la nevera.', 'Tira los libros por la ventana.'],
  ],
  fr: [
    ['A : Bonjour ! Comment allez-vous ?', 'A : Moi aussi, je vais bien. Merci.', 'B : Je vais bien, merci. Et vous ?', 'B : J’ai vingt ans.', 'B : C’est sur la table.'],
    ['A : Bonsoir. Une table pour deux, s’il vous plaît.', 'A : Près de la fenêtre, s’il vous plaît.', 'B : Bien sûr. Où voulez-vous vous asseoir ?', 'B : Ça coûte cinq euros.', 'B : J’aime mon chat.'],
    ['A : Excusez-moi, où est la gare ?', 'A : Merci beaucoup !', 'B : Allez tout droit, puis tournez à gauche.', 'B : J’ai une voiture rouge.', 'B : Il est neuf heures.'],
    ['Ana a faim. Elle va à la cuisine et ouvre le frigo.', 'Elle fait un sandwich et le mange.', 'Elle met son manteau et va nager.', 'Elle chante une chanson au frigo.'],
    ['Il pleut. Tom n’a pas de parapluie.', 'Il achète un parapluie au magasin.', 'Il éteint le soleil.', 'Il lit un livre à la pluie.'],
    ['Lena a un examen demain. Elle est nerveuse.', 'Elle révise deux heures et se couche tôt.', 'Elle met l’examen au frigo.', 'Elle jette ses livres par la fenêtre.'],
  ],
  de: [
    ['A: Hallo! Wie geht es dir?', 'A: Mir geht es auch gut. Danke.', 'B: Mir geht es gut, danke. Und dir?', 'B: Ich bin zwanzig Jahre alt.', 'B: Es liegt auf dem Tisch.'],
    ['A: Guten Abend. Einen Tisch für zwei, bitte.', 'A: Am Fenster, bitte.', 'B: Natürlich. Wo möchten Sie sitzen?', 'B: Das kostet fünf Euro.', 'B: Ich mag meine Katze.'],
    ['A: Entschuldigung, wo ist der Bahnhof?', 'A: Vielen Dank!', 'B: Gehen Sie geradeaus und dann links.', 'B: Ich habe ein rotes Auto.', 'B: Es ist neun Uhr.'],
    ['Ana hat Hunger. Sie geht in die Küche und öffnet den Kühlschrank.', 'Sie macht ein Sandwich und isst es.', 'Sie zieht den Mantel an und geht schwimmen.', 'Sie singt dem Kühlschrank ein Lied.'],
    ['Es regnet. Tom hat keinen Regenschirm.', 'Er kauft im Laden einen Regenschirm.', 'Er schaltet die Sonne aus.', 'Er liest dem Regen ein Buch vor.'],
    ['Lena hat morgen eine Prüfung. Sie ist nervös.', 'Sie lernt zwei Stunden und geht früh ins Bett.', 'Sie legt die Prüfung in den Kühlschrank.', 'Sie wirft die Bücher aus dem Fenster.'],
  ],
  ru: [
    ['А: Привет! Как дела?', 'А: У меня тоже всё хорошо. Спасибо.', 'Б: Хорошо, спасибо. А у тебя?', 'Б: Мне двадцать лет.', 'Б: Он лежит на столе.'],
    ['А: Добрый вечер. Столик на двоих, пожалуйста.', 'А: У окна, пожалуйста.', 'Б: Конечно. Где вы хотите сесть?', 'Б: Это стоит пять евро.', 'Б: Я люблю свою кошку.'],
    ['А: Извините, где вокзал?', 'А: Большое спасибо!', 'Б: Идите прямо, потом налево.', 'Б: У меня красная машина.', 'Б: Сейчас девять часов.'],
    ['Аня голодна. Она идёт на кухню и открывает холодильник.', 'Она делает бутерброд и ест его.', 'Она надевает пальто и идёт плавать.', 'Она поёт холодильнику песню.'],
    ['Идёт дождь. У Тома нет зонта.', 'Он покупает зонт в магазине.', 'Он выключает солнце.', 'Он читает дождю книгу.'],
    ['У Лены завтра экзамен. Она волнуется.', 'Она учится два часа и рано ложится спать.', 'Она кладёт экзамен в холодильник.', 'Она выбрасывает книги из окна.'],
  ],
  zh: [
    ['A：你好！你好吗？', 'A：我也很好。谢谢。', 'B：我很好，谢谢。你呢？', 'B：我二十岁。', 'B：它在桌子上。'],
    ['A：晚上好。请给我们一张两人桌。', 'A：请安排在窗边。', 'B：好的。您想坐在哪里？', 'B：这个五欧元。', 'B：我喜欢我的猫。'],
    ['A：请问，火车站在哪里？', 'A：非常感谢！', 'B：一直往前走，然后向左拐。', 'B：我有一辆红色的车。', 'B：现在九点。'],
    ['安娜饿了。她走进厨房，打开冰箱。', '她做了一个三明治，吃了它。', '她穿上外套，去游泳。', '她对着冰箱唱了一首歌。'],
    ['下雨了。汤姆没有伞。', '他在商店里买了一把伞。', '他把太阳关掉了。', '他给雨读了一本书。'],
    ['莉娜明天有考试。她很紧张。', '她学习了两个小时，然后早早睡觉。', '她把考试放进冰箱。', '她把书扔出窗外。'],
  ],
  ar: [
    ['أ: مرحبًا! كيف حالك؟', 'أ: وأنا بخير أيضًا. شكرًا.', 'ب: أنا بخير، شكرًا. وأنت؟', 'ب: عمري عشرون سنة.', 'ب: إنه على الطاولة.'],
    ['أ: مساء الخير. طاولة لشخصين، من فضلك.', 'أ: بجانب النافذة، من فضلك.', 'ب: بالتأكيد. أين تريد أن تجلس؟', 'ب: ثمنه خمسة يورو.', 'ب: أحب قطتي.'],
    ['أ: عفوًا، أين المحطة؟', 'أ: شكرًا جزيلًا!', 'ب: امشِ مستقيمًا ثم انعطف يسارًا.', 'ب: عندي سيارة حمراء.', 'ب: الساعة التاسعة.'],
    ['آنا جائعة. تذهب إلى المطبخ وتفتح الثلاجة.', 'تصنع شطيرة وتأكلها.', 'ترتدي معطفها وتذهب للسباحة.', 'تغني أغنية للثلاجة.'],
    ['تمطر. ليس مع توم مظلة.', 'يشتري مظلة من المتجر.', 'يطفئ الشمس.', 'يقرأ كتابًا للمطر.'],
    ['عند لينا امتحان غدًا. هي متوترة.', 'تدرس ساعتين وتنام مبكرًا.', 'تضع الامتحان في الثلاجة.', 'ترمي الكتب من النافذة.'],
  ],
};

/** The items of a language; none for one without hand-made ones. */
export function completeItems(lang: string): CompleteItem[] {
  return (T[lang] ?? []).map((r, i): CompleteItem => (i < 3 ? { kind: 'dialogue', before: r[0], after: r[1], options: [r[2], r[3], r[4]] } : { kind: 'story', before: r[0], options: [r[1], r[2], r[3]] }));
}

export function makeComplete(item: CompleteItem, random: () => number): CompleteRound {
  const options = [...item.options].sort(() => random() - 0.5);
  return { item, options, answer: options.indexOf(item.options[0]) };
}
