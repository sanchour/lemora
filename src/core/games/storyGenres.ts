// More hand-made stories (6-21 G6, F1205, F1208, F1210 to F1214): one of each kind for the six core languages, at A1. A story is its graph, written once,
// and its words, written for each language in a fixed order (the numbers in the comments). Max makes more, and learners can write their own.
import type { StoryGame } from './story';

type S = Omit<StoryGame, 'id'>;
interface Genre {
  id: string;
  build: (s: string[]) => S;
  text: Record<string, string[]>;
}

export const GENRES: Genre[] = [
  {
    // 0 title, 1 kitchen, 2 table, 3 floor, 4 accuse, 5 win, 6 wrong, 7 table?, 8 floor?, 9 say who, 10 back, 11 cat, 12 dog, 13 brother, 14 crumbs, 15 paw prints
    id: 'mystery',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'kitchen', items: { crumbs: s[14], paws: s[15] },
      scenes: {
        kitchen: { text: s[1], choices: [{ label: s[7], to: 'table' }, { label: s[8], to: 'floor' }, { label: s[9], to: 'accuse', needs: 'crumbs' }] },
        table: { text: s[2], gives: 'crumbs', choices: [{ label: s[10], to: 'kitchen' }] },
        floor: { text: s[3], gives: 'paws', choices: [{ label: s[10], to: 'kitchen' }] },
        accuse: { text: s[4], choices: [{ label: s[11], to: 'wrong' }, { label: s[12], to: 'win', needs: 'paws' }, { label: s[13], to: 'wrong' }] },
        win: { text: s[5], choices: [], end: 'win' },
        wrong: { text: s[6], choices: [], end: 'lose' },
      },
    }),
    text: {
      es: ['El pastel desaparecido', '¡El pastel ha desaparecido! ¿Quién se lo llevó? Mira por la cocina.', 'En la mesa hay migas pequeñas. Llevan al salón.', 'En el suelo hay huellas sucias de patas.', 'Todos están en la cocina. ¿Quién se llevó el pastel?', '¡Sí! El perro se llevó el pastel. ¡Tiene migas en la nariz!', 'No, eso no es correcto. Mira otra vez.', 'Mirar la mesa', 'Mirar el suelo', 'Decir quién fue', 'Volver', 'El gato', 'El perro', 'Tu hermano', 'las migas', 'las huellas'],
      fr: ['Le gâteau disparu', 'Le gâteau a disparu ! Qui l’a pris ? Regardez dans la cuisine.', 'Sur la table, il y a de petites miettes. Elles vont au salon.', 'Par terre, il y a des traces de pattes sales.', 'Tout le monde est dans la cuisine. Qui a pris le gâteau ?', 'Oui ! Le chien a pris le gâteau. Il a des miettes sur le nez !', 'Non, ce n’est pas ça. Regardez encore.', 'Regarder la table', 'Regarder par terre', 'Dire qui c’est', 'Revenir', 'Le chat', 'Le chien', 'Votre frère', 'les miettes', 'les traces'],
      de: ['Der verschwundene Kuchen', 'Der Kuchen ist weg! Wer hat ihn genommen? Sieh dich in der Küche um.', 'Auf dem Tisch liegen kleine Krümel. Sie führen ins Wohnzimmer.', 'Auf dem Boden sind schmutzige Pfotenabdrücke.', 'Alle sind in der Küche. Wer hat den Kuchen genommen?', 'Ja! Der Hund hat den Kuchen genommen. Er hat Krümel an der Nase!', 'Nein, das stimmt nicht. Schau noch einmal.', 'Den Tisch ansehen', 'Den Boden ansehen', 'Sagen, wer es war', 'Zurück', 'Die Katze', 'Der Hund', 'Dein Bruder', 'die Krümel', 'die Pfotenabdrücke'],
      ru: ['Пропавший торт', 'Торт исчез! Кто его взял? Осмотри кухню.', 'На столе лежат маленькие крошки. Они ведут в гостиную.', 'На полу грязные следы лап.', 'Все на кухне. Кто взял торт?', 'Да! Торт взяла собака. У неё крошки на носу!', 'Нет, это неправильно. Посмотри ещё раз.', 'Посмотреть на стол', 'Посмотреть на пол', 'Сказать, кто это', 'Назад', 'Кошка', 'Собака', 'Твой брат', 'крошки', 'следы лап'],
      zh: ['不见了的蛋糕', '蛋糕不见了！谁拿走了？看看厨房。', '桌子上有一些小碎屑。它们通向客厅。', '地板上有脏脏的爪印。', '大家都在厨房里。谁拿了蛋糕？', '对！是小狗拿了蛋糕。它的鼻子上有碎屑！', '不，不对。再看看。', '看桌子', '看地板', '说出是谁', '回去', '猫', '狗', '你的哥哥', '碎屑', '爪印'],
      ar: ['الكعكة المفقودة', 'اختفت الكعكة! من أخذها؟ انظر في المطبخ.', 'على الطاولة فتات صغير. يؤدي إلى غرفة الجلوس.', 'على الأرض آثار أقدام حيوان متسخة.', 'الجميع في المطبخ. من أخذ الكعكة؟', 'نعم! الكلب أخذ الكعكة. على أنفه فتات!', 'لا، هذا غير صحيح. انظر مرة أخرى.', 'انظر إلى الطاولة', 'انظر إلى الأرض', 'قل من فعلها', 'ارجع', 'القطة', 'الكلب', 'أخوك', 'الفتات', 'آثار الأقدام'],
    },
  },
  {
    // 0 title, 1 shop, 2 window, 3 street, 4 park, 5 win, 6 look at window, 7 go outside, 8 follow, 9 call police, 10 back, 11 glass, 12 shoe print
    id: 'detective',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'shop', items: { glass: s[11], shoe: s[12] },
      scenes: {
        shop: { text: s[1], choices: [{ label: s[6], to: 'window' }, { label: s[7], to: 'street', needs: 'glass' }] },
        window: { text: s[2], gives: 'glass', choices: [{ label: s[10], to: 'shop' }] },
        street: { text: s[3], gives: 'shoe', choices: [{ label: s[8], to: 'park', needs: 'shoe' }, { label: s[10], to: 'shop' }] },
        park: { text: s[4], choices: [{ label: s[9], to: 'win' }] },
        win: { text: s[5], choices: [], end: 'win' },
      },
    }),
    text: {
      es: ['El anillo robado', 'Falta un anillo en la tienda. El dueño está triste. Tú eres el detective.', 'La ventana está abierta. Hay cristales rotos en el suelo.', 'Fuera encuentras una huella grande y mojada de zapato. Va al parque.', 'En el parque un hombre está sentado con una caja pequeña. ¡Es el anillo!', 'La policía se lleva al hombre. ¡El dueño está contento!', 'Mirar la ventana', 'Salir', 'Seguir las huellas', 'Llamar a la policía', 'Volver', 'los cristales', 'la huella'],
      fr: ['La bague volée', 'Une bague a disparu de la boutique. Le patron est triste. Vous êtes le détective.', 'La fenêtre est ouverte. Il y a du verre cassé par terre.', 'Dehors, vous trouvez une grande trace de chaussure mouillée. Elle va au parc.', 'Dans le parc, un homme est assis avec une petite boîte. C’est la bague !', 'La police emmène l’homme. Le patron est content !', 'Regarder la fenêtre', 'Sortir', 'Suivre les traces', 'Appeler la police', 'Revenir', 'le verre', 'la trace'],
      de: ['Der gestohlene Ring', 'Im Laden fehlt ein Ring. Der Besitzer ist traurig. Du bist der Detektiv.', 'Das Fenster ist offen. Auf dem Boden liegt zerbrochenes Glas.', 'Draußen findest du einen großen, nassen Schuhabdruck. Er führt zum Park.', 'Im Park sitzt ein Mann mit einer kleinen Schachtel. Es ist der Ring!', 'Die Polizei nimmt den Mann mit. Der Besitzer ist froh!', 'Das Fenster ansehen', 'Hinausgehen', 'Den Spuren folgen', 'Die Polizei rufen', 'Zurück', 'das Glas', 'der Schuhabdruck'],
      ru: ['Украденное кольцо', 'В магазине пропало кольцо. Хозяин грустит. Ты — детектив.', 'Окно открыто. На полу разбитое стекло.', 'На улице ты находишь большой мокрый след от ботинка. Он ведёт в парк.', 'В парке сидит мужчина с маленькой коробкой. Это кольцо!', 'Полиция забирает мужчину. Хозяин рад!', 'Посмотреть на окно', 'Выйти на улицу', 'Идти по следам', 'Позвать полицию', 'Назад', 'стекло', 'след ботинка'],
      zh: ['被偷的戒指', '店里少了一枚戒指。店主很难过。你是侦探。', '窗户开着。地板上有碎玻璃。', '在外面你发现一个又大又湿的鞋印。它通向公园。', '公园里有个男人坐着，手里有一个小盒子。那是戒指！', '警察带走了那个男人。店主很高兴！', '看窗户', '去外面', '跟着鞋印走', '叫警察', '回去', '玻璃', '鞋印'],
      ar: ['الخاتم المسروق', 'اختفى خاتم من المتجر. صاحب المتجر حزين. أنت المحقق.', 'النافذة مفتوحة. على الأرض زجاج مكسور.', 'في الخارج تجد أثر حذاء كبيرًا ومبللًا. يؤدي إلى الحديقة.', 'في الحديقة يجلس رجل ومعه علبة صغيرة. إنه الخاتم!', 'تأخذ الشرطة الرجل. صاحب المتجر سعيد!', 'انظر إلى النافذة', 'اخرج', 'اتبع آثار الحذاء', 'اتصل بالشرطة', 'ارجع', 'الزجاج', 'أثر الحذاء'],
    },
  },
  {
    // 0 title, 1 station, 2 desk, 3 rude, 4 bought, 5 platform, 6 win, 7 go to desk, 8 polite, 9 rude line, 10 go to platform, 11 get on, 12 try again, 13 back, 14 ticket
    id: 'travel',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'station', items: { ticket: s[14] },
      scenes: {
        station: { text: s[1], choices: [{ label: s[7], to: 'desk' }, { label: s[10], to: 'platform', needs: 'ticket' }] },
        desk: { text: s[2], choices: [{ label: s[8], to: 'bought' }, { label: s[9], to: 'rude' }] },
        rude: { text: s[3], choices: [{ label: s[12], to: 'desk' }] },
        bought: { text: s[4], gives: 'ticket', choices: [{ label: s[13], to: 'station' }] },
        platform: { text: s[5], choices: [{ label: s[11], to: 'win' }] },
        win: { text: s[6], choices: [], end: 'win' },
      },
    }),
    text: {
      es: ['En la estación', 'Estás en la estación de tren. Quieres ir a la ciudad.', 'La mujer de la ventanilla dice: «¡Hola! ¿En qué puedo ayudarle?»', 'La mujer no está contenta. «Sea amable, por favor», dice.', '«Aquí tiene su billete. ¡Buen viaje!»', 'El tren está aquí. Enseñas tu billete.', 'El tren sale. ¡Vas camino a la ciudad!', 'Ir a la ventanilla', 'Decir: «Un billete para la ciudad, por favor».', 'Decir: «¡Deme un billete!»', 'Ir al andén', 'Subir al tren', 'Intentarlo otra vez', 'Volver', 'el billete'],
      fr: ['À la gare', 'Vous êtes à la gare. Vous voulez aller en ville.', 'La femme au guichet dit : « Bonjour ! Que puis-je faire pour vous ? »', 'La femme n’est pas contente. « Soyez poli, s’il vous plaît », dit-elle.', '« Voici votre billet. Bon voyage ! »', 'Le train est là. Vous montrez votre billet.', 'Le train part. Vous êtes en route pour la ville !', 'Aller au guichet', 'Dire : « Un billet pour la ville, s’il vous plaît. »', 'Dire : « Donnez-moi un billet ! »', 'Aller sur le quai', 'Monter dans le train', 'Essayer encore', 'Revenir', 'le billet'],
      de: ['Am Bahnhof', 'Du bist am Bahnhof. Du willst in die Stadt fahren.', 'Die Frau am Schalter sagt: „Guten Tag! Wie kann ich Ihnen helfen?“', 'Die Frau ist nicht froh. „Bitte seien Sie höflich“, sagt sie.', '„Hier ist Ihre Fahrkarte. Gute Reise!“', 'Der Zug ist da. Du zeigst deine Fahrkarte.', 'Der Zug fährt ab. Du bist auf dem Weg in die Stadt!', 'Zum Schalter gehen', 'Sagen: „Eine Fahrkarte in die Stadt, bitte.“', 'Sagen: „Geben Sie mir eine Fahrkarte!“', 'Zum Bahnsteig gehen', 'In den Zug steigen', 'Noch einmal versuchen', 'Zurück', 'die Fahrkarte'],
      ru: ['На вокзале', 'Ты на вокзале. Ты хочешь поехать в город.', 'Женщина в кассе говорит: «Здравствуйте! Чем могу помочь?»', 'Женщина недовольна. «Будьте вежливы, пожалуйста», — говорит она.', '«Вот ваш билет. Счастливого пути!»', 'Поезд здесь. Ты показываешь билет.', 'Поезд отправляется. Ты едешь в город!', 'Подойти к кассе', 'Сказать: «Один билет до города, пожалуйста».', 'Сказать: «Дайте мне билет!»', 'Пойти на платформу', 'Сесть в поезд', 'Попробовать ещё раз', 'Назад', 'билет'],
      zh: ['在火车站', '你在火车站。你想去市里。', '售票窗口的女士说：“你好！有什么可以帮您？”', '那位女士不高兴。她说：“请有礼貌。”', '“这是您的票。一路平安！”', '火车来了。你出示了车票。', '火车开了。你正在去市里的路上！', '去售票窗口', '说：“请给我一张去市里的票。”', '说：“给我一张票！”', '去站台', '上火车', '再试一次', '回去', '车票'],
      ar: ['في المحطة', 'أنت في محطة القطار. تريد الذهاب إلى المدينة.', 'تقول المرأة عند الشباك: «مرحبًا! كيف أساعدك؟»', 'المرأة غير سعيدة. تقول: «من فضلك كن مهذبًا».', '«تفضل تذكرتك. رحلة سعيدة!»', 'وصل القطار. تُري التذكرة.', 'يغادر القطار. أنت في طريقك إلى المدينة!', 'اذهب إلى الشباك', 'قل: «تذكرة إلى المدينة، من فضلك».', 'قل: «أعطني تذكرة!»', 'اذهب إلى الرصيف', 'اركب القطار', 'حاول مرة أخرى', 'ارجع', 'التذكرة'],
    },
  },
  {
    // 0 title, 1 square, 2 bakery, 3 park, 4 museum, 5 win, 6 go bakery, 7 go park, 8 go museum, 9 feed ducks, 10 back, 11 bread
    id: 'city',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'square', items: { bread: s[11] },
      scenes: {
        square: { text: s[1], choices: [{ label: s[6], to: 'bakery' }, { label: s[7], to: 'park' }, { label: s[8], to: 'museum' }] },
        bakery: { text: s[2], gives: 'bread', choices: [{ label: s[10], to: 'square' }] },
        park: { text: s[3], choices: [{ label: s[9], to: 'win', needs: 'bread' }, { label: s[10], to: 'square' }] },
        museum: { text: s[4], choices: [{ label: s[10], to: 'square' }] },
        win: { text: s[5], choices: [], end: 'win' },
      },
    }),
    text: {
      es: ['Un paseo por la ciudad', 'Estás en la plaza principal. Hay una panadería, un parque y un museo.', 'Compras una barra de pan. El panadero sonríe.', 'En el parque hay patos en el lago. Parecen tener hambre.', 'Hoy el museo está cerrado.', 'Le das el pan a los patos. ¡Están muy contentos!', 'Ir a la panadería', 'Ir al parque', 'Ir al museo', 'Dar el pan a los patos', 'Volver a la plaza', 'el pan'],
      fr: ['Une promenade en ville', 'Vous êtes sur la place principale. Il y a une boulangerie, un parc et un musée.', 'Vous achetez une baguette. Le boulanger sourit.', 'Dans le parc, il y a des canards sur le lac. Ils ont l’air d’avoir faim.', 'Aujourd’hui, le musée est fermé.', 'Vous donnez le pain aux canards. Ils sont très contents !', 'Aller à la boulangerie', 'Aller au parc', 'Aller au musée', 'Donner le pain aux canards', 'Revenir sur la place', 'le pain'],
      de: ['Ein Spaziergang durch die Stadt', 'Du bist auf dem Hauptplatz. Es gibt eine Bäckerei, einen Park und ein Museum.', 'Du kaufst ein Brot. Der Bäcker lächelt.', 'Im Park sind Enten auf dem See. Sie sehen hungrig aus.', 'Das Museum ist heute geschlossen.', 'Du gibst den Enten das Brot. Sie sind sehr froh!', 'Zur Bäckerei gehen', 'In den Park gehen', 'Ins Museum gehen', 'Den Enten das Brot geben', 'Zurück zum Platz', 'das Brot'],
      ru: ['Прогулка по городу', 'Ты на главной площади. Здесь есть пекарня, парк и музей.', 'Ты покупаешь батон хлеба. Пекарь улыбается.', 'В парке на озере плавают утки. Они выглядят голодными.', 'Сегодня музей закрыт.', 'Ты отдаёшь хлеб уткам. Они очень рады!', 'Пойти в пекарню', 'Пойти в парк', 'Пойти в музей', 'Отдать хлеб уткам', 'Вернуться на площадь', 'хлеб'],
      zh: ['在城里散步', '你在主广场上。这里有一家面包店、一个公园和一座博物馆。', '你买了一个面包。面包师笑了。', '公园的湖里有鸭子。它们看起来很饿。', '今天博物馆关门。', '你把面包给了鸭子。它们很高兴！', '去面包店', '去公园', '去博物馆', '把面包给鸭子', '回到广场', '面包'],
      ar: ['نزهة في المدينة', 'أنت في الساحة الرئيسية. هناك مخبز وحديقة ومتحف.', 'تشتري رغيف خبز. الخباز يبتسم.', 'في الحديقة بط على البحيرة. يبدو جائعًا.', 'المتحف مغلق اليوم.', 'تعطي الخبز للبط. إنه سعيد جدًا!', 'اذهب إلى المخبز', 'اذهب إلى الحديقة', 'اذهب إلى المتحف', 'أعطِ الخبز للبط', 'ارجع إلى الساحة', 'الخبز'],
    },
  },
  {
    // 0 title, 1 road, 2 field, 3 house, 4 hotel, 5 cold, 6 walk in rain, 7 knock, 8 follow map, 9 walk on, 10 back, 11 map
    id: 'survival',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'road', health: 2, items: { map: s[11] },
      scenes: {
        road: { text: s[1], choices: [{ label: s[6], to: 'field', cost: 1 }, { label: s[7], to: 'house' }] },
        field: { text: s[2], choices: [{ label: s[9], to: 'cold', cost: 1 }, { label: s[10], to: 'road' }] },
        house: { text: s[3], gives: 'map', choices: [{ label: s[8], to: 'hotel', needs: 'map', cost: 1 }, { label: s[10], to: 'road' }] },
        hotel: { text: s[4], choices: [], end: 'win' },
        cold: { text: s[5], choices: [], end: 'lose' },
      },
    }),
    text: {
      es: ['Perdido bajo la lluvia', 'Llueve y estás perdido. Tienes frío. Busca ayuda.', 'Caminas por el campo. Está oscuro y hace mucho frío.', 'Una mujer abre la puerta. «¡Pasa! Toma un mapa.»', 'Sigues el mapa. ¡Hay un hotel caliente!', 'Tienes demasiado frío. No puedes caminar más.', 'Caminar bajo la lluvia', 'Llamar a la puerta roja', 'Seguir el mapa', 'Seguir caminando en la oscuridad', 'Volver', 'el mapa'],
      fr: ['Perdu sous la pluie', 'Il pleut et vous êtes perdu. Vous avez froid. Cherchez de l’aide.', 'Vous marchez dans le champ. Il fait noir et très froid.', 'Une femme ouvre la porte. « Entrez ! Voici une carte. »', 'Vous suivez la carte. Il y a un hôtel bien chaud !', 'Vous avez trop froid. Vous ne pouvez plus marcher.', 'Marcher sous la pluie', 'Frapper à la porte rouge', 'Suivre la carte', 'Continuer dans le noir', 'Revenir', 'la carte'],
      de: ['Verirrt im Regen', 'Es regnet und du hast dich verirrt. Dir ist kalt. Suche Hilfe.', 'Du gehst über das Feld. Es ist dunkel und sehr kalt.', 'Eine Frau öffnet die Tür. „Komm herein! Hier ist eine Karte.“', 'Du folgst der Karte. Da ist ein warmes Hotel!', 'Dir ist zu kalt. Du kannst nicht weitergehen.', 'Im Regen gehen', 'An die rote Tür klopfen', 'Der Karte folgen', 'Im Dunkeln weitergehen', 'Zurück', 'die Karte'],
      ru: ['Заблудился под дождём', 'Идёт дождь, и ты заблудился. Тебе холодно. Ищи помощь.', 'Ты идёшь по полю. Темно и очень холодно.', 'Женщина открывает дверь. «Заходи! Вот карта.»', 'Ты идёшь по карте. Вот тёплая гостиница!', 'Тебе слишком холодно. Ты больше не можешь идти.', 'Идти под дождём', 'Постучать в красную дверь', 'Идти по карте', 'Идти дальше в темноте', 'Назад', 'карта'],
      zh: ['雨中迷路', '下雨了，你迷路了。你很冷。去找人帮忙。', '你走在田野里。天很黑，非常冷。', '一位女士开了门。“进来吧！给你一张地图。”', '你照着地图走。那里有一家温暖的旅馆！', '你太冷了。你再也走不动了。', '在雨里走', '敲红色的门', '照着地图走', '在黑暗中继续走', '回去', '地图'],
      ar: ['تائه تحت المطر', 'تمطر وأنت تائه. تشعر بالبرد. ابحث عن مساعدة.', 'تمشي في الحقل. الظلام دامس والبرد شديد.', 'تفتح امرأة الباب. «تفضل بالدخول! هذه خريطة.»', 'تتبع الخريطة. هناك فندق دافئ!', 'بردك شديد جدًا. لا تستطيع المشي أكثر.', 'امشِ تحت المطر', 'اطرق الباب الأحمر', 'اتبع الخريطة', 'تابع المشي في الظلام', 'ارجع', 'الخريطة'],
    },
  },
  {
    // 0 title, 1 door, 2 counter, 3 greeted, 4 ordered, 5 rude, 6 win, 7 go counter, 8 greet, 9 point, 10 order, 11 pay, 12 try again, 13 greeting, 14 coffee
    id: 'roleplay',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'door', items: { hello: s[13], coffee: s[14] },
      scenes: {
        door: { text: s[1], choices: [{ label: s[7], to: 'counter' }] },
        counter: { text: s[2], choices: [{ label: s[8], to: 'greeted' }, { label: s[9], to: 'rude' }] },
        rude: { text: s[5], choices: [{ label: s[12], to: 'counter' }] },
        greeted: { text: s[3], gives: 'hello', choices: [{ label: s[10], to: 'ordered', needs: 'hello' }] },
        ordered: { text: s[4], gives: 'coffee', choices: [{ label: s[11], to: 'win', needs: 'coffee' }] },
        win: { text: s[6], choices: [], end: 'win' },
      },
    }),
    text: {
      es: ['En la cafetería', 'Estás en una cafetería pequeña. Un hombre te espera detrás del mostrador.', 'El hombre te mira y espera.', '«¡Buenos días! ¿Qué desea?»', '«Aquí tiene su café. Son dos euros.»', 'El hombre no entiende. Inténtalo otra vez, con educación.', 'Pagas dos euros. «¡Gracias! Que disfrute del café.»', 'Ir al mostrador', 'Decir: «¡Buenos días!»', 'Señalar sin decir nada', 'Decir: «Un café, por favor».', 'Pagar dos euros', 'Intentarlo otra vez', 'el saludo', 'el café'],
      fr: ['Au café', 'Vous êtes dans un petit café. Un homme derrière le comptoir vous attend.', 'L’homme vous regarde et attend.', '« Bonjour ! Que désirez-vous ? »', '« Voici votre café. Ça fait deux euros. »', 'L’homme ne comprend pas. Essayez encore, poliment.', 'Vous payez deux euros. « Merci ! Bon café. »', 'Aller au comptoir', 'Dire : « Bonjour ! »', 'Montrer du doigt sans rien dire', 'Dire : « Un café, s’il vous plaît. »', 'Payer deux euros', 'Essayer encore', 'le bonjour', 'le café'],
      de: ['Im Café', 'Du bist in einem kleinen Café. Ein Mann hinter der Theke wartet auf dich.', 'Der Mann sieht dich an und wartet.', '„Guten Morgen! Was möchten Sie?“', '„Hier ist Ihr Kaffee. Das macht zwei Euro.“', 'Der Mann versteht nicht. Versuche es noch einmal, höflich.', 'Du bezahlst zwei Euro. „Danke! Genießen Sie Ihren Kaffee.“', 'Zur Theke gehen', 'Sagen: „Guten Morgen!“', 'Zeigen und nichts sagen', 'Sagen: „Einen Kaffee, bitte.“', 'Zwei Euro bezahlen', 'Noch einmal versuchen', 'der Gruß', 'der Kaffee'],
      ru: ['В кафе', 'Ты в маленьком кафе. За стойкой тебя ждёт мужчина.', 'Мужчина смотрит на тебя и ждёт.', '«Доброе утро! Что вы хотите?»', '«Вот ваш кофе. С вас два евро.»', 'Мужчина не понимает. Попробуй ещё раз, вежливо.', 'Ты платишь два евро. «Спасибо! Приятного кофе.»', 'Подойти к стойке', 'Сказать: «Доброе утро!»', 'Показать пальцем и ничего не сказать', 'Сказать: «Один кофе, пожалуйста».', 'Заплатить два евро', 'Попробовать ещё раз', 'приветствие', 'кофе'],
      zh: ['在咖啡馆', '你在一家小咖啡馆里。柜台后面有一个男人在等你。', '那个男人看着你，等着。', '“早上好！您想要什么？”', '“这是您的咖啡。两欧元。”', '那个男人听不懂。请再试一次，要有礼貌。', '你付了两欧元。“谢谢！祝您喝得愉快。”', '去柜台', '说：“早上好！”', '用手指一下，什么也不说', '说：“请给我一杯咖啡。”', '付两欧元', '再试一次', '问候', '咖啡'],
      ar: ['في المقهى', 'أنت في مقهى صغير. رجل خلف المنضدة ينتظرك.', 'ينظر إليك الرجل وينتظر.', '«صباح الخير! ماذا تريد؟»', '«تفضل قهوتك. الحساب يورو واحد.» ', 'لا يفهم الرجل. حاول مرة أخرى بأدب.', 'تدفع يورو واحدًا. «شكرًا! بالهناء والعافية.»', 'اذهب إلى المنضدة', 'قل: «صباح الخير!»', 'أشر ولا تقل شيئًا', 'قل: «قهوة، من فضلك».', 'ادفع يورو واحدًا', 'حاول مرة أخرى', 'التحية', 'القهوة'],
    },
  },
  {
    // 0 title, 1 party, 2 hello, 3 where, 4 shy, 5 win, 6 hello line, 7 ask where, 8 ask number, 9 say nothing, 10 back, 11 her name, 12 her country
    id: 'conversation',
    build: (s) => ({
      title: s[0], level: 'A1', start: 'party', items: { name: s[11], country: s[12] },
      scenes: {
        party: { text: s[1], choices: [{ label: s[6], to: 'hello' }, { label: s[7], to: 'where', needs: 'name' }, { label: s[8], to: 'win', needs: 'country' }, { label: s[9], to: 'shy' }] },
        hello: { text: s[2], gives: 'name', choices: [{ label: s[10], to: 'party' }] },
        where: { text: s[3], gives: 'country', choices: [{ label: s[10], to: 'party' }] },
        shy: { text: s[4], choices: [{ label: s[10], to: 'party' }] },
        win: { text: s[5], choices: [], end: 'win' },
      },
    }),
    text: {
      es: ['Un amigo nuevo', 'Estás en una fiesta. Una chica simpática está a tu lado.', '«¡Hola! Soy Mia. ¡Mucho gusto!»', '«Soy de Italia. ¿Y tú?»', 'Ella espera. ¡Di algo!', '«¡Claro! Aquí tienes mi número.» ¡Tienes una amiga nueva!', 'Decir: «¡Hola! Me llamo Sam».', 'Preguntar: «¿De dónde eres?»', 'Preguntar: «¿Me das tu número?»', 'No decir nada', 'Volver', 'su nombre', 'su país'],
      fr: ['Un nouvel ami', 'Vous êtes à une fête. Une fille sympathique est à côté de vous.', '« Salut ! Je suis Mia. Enchantée ! »', '« Je viens d’Italie. Et vous ? »', 'Elle attend. Dites quelque chose !', '« Bien sûr ! Voici mon numéro. » Vous avez une nouvelle amie !', 'Dire : « Bonjour ! Je m’appelle Sam. »', 'Demander : « D’où venez-vous ? »', 'Demander : « Puis-je avoir votre numéro ? »', 'Ne rien dire', 'Revenir', 'son nom', 'son pays'],
      de: ['Eine neue Freundin', 'Du bist auf einer Party. Ein nettes Mädchen steht neben dir.', '„Hallo! Ich bin Mia. Schön, dich kennenzulernen!“', '„Ich komme aus Italien. Und du?“', 'Sie wartet. Sag etwas!', '„Klar! Hier ist meine Nummer.“ Du hast eine neue Freundin!', 'Sagen: „Hallo! Ich heiße Sam.“', 'Fragen: „Woher kommst du?“', 'Fragen: „Kann ich deine Nummer haben?“', 'Nichts sagen', 'Zurück', 'ihr Name', 'ihr Land'],
      ru: ['Новый друг', 'Ты на вечеринке. Рядом с тобой стоит приветливая девушка.', '«Привет! Я Миа. Очень приятно!»', '«Я из Италии. А ты?»', 'Она ждёт. Скажи что-нибудь!', '«Конечно! Вот мой номер.» У тебя новая подруга!', 'Сказать: «Привет! Меня зовут Сэм».', 'Спросить: «Откуда ты?»', 'Спросить: «Можно твой номер?»', 'Ничего не говорить', 'Назад', 'её имя', 'её страна'],
      zh: ['新朋友', '你在一个聚会上。一个友好的女孩站在你旁边。', '“你好！我是米娅。很高兴认识你！”', '“我来自意大利。你呢？”', '她在等。说点什么吧！', '“当然！这是我的号码。”你有了一个新朋友！', '说：“你好！我叫山姆。”', '问：“你是哪里人？”', '问：“可以给我你的号码吗？”', '什么也不说', '回去', '她的名字', '她的国家'],
      ar: ['صديقة جديدة', 'أنت في حفلة. تقف بجانبك فتاة لطيفة.', '«مرحبًا! أنا ميا. تشرفت بمعرفتك!»', '«أنا من إيطاليا. وأنت؟»', 'هي تنتظر. قل شيئًا!', '«طبعًا! هذا رقمي.» صار لديك صديقة جديدة!', 'قل: «مرحبًا! اسمي سام».', 'اسأل: «من أين أنت؟»', 'اسأل: «هل يمكنني الحصول على رقمك؟»', 'لا تقل شيئًا', 'ارجع', 'اسمها', 'بلدها'],
    },
  },
];
