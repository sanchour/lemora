// The example sentence on the level step, word by word (Lemora 3.4): each sentence is split into small units, each with
// what it means in English, kept here so a hover, a click, a drag across several, or a long press gives its translation
// at once, before any dictionary is installed. The units, put back together, are the sentence (tested).
import type { Level } from './levels';

export interface Unit { text: string; gloss: string }
export interface LevelExample { units: Unit[]; en: string }

/** "text=meaning|text=meaning…": a unit may hold several words ("aire fresco.=fresh air"). */
const parse = (compact: string, en: string): LevelExample => ({
  units: compact.split('|').map((u) => {
    const at = u.lastIndexOf('=');
    return { text: u.slice(0, at), gloss: u.slice(at + 1) };
  }),
  en,
});

/** Chinese is written without spaces; every other language here puts a space between units. */
export const joinUnits = (lang: string, units: readonly Unit[]) => units.map((u) => u.text).join(lang === 'zh' ? '' : ' ');

const RAW: Record<string, Record<Level, [string, string]>> = {
  es: {
    A0: ['Hola,=hello|¿cómo=how|estás?=are you', 'Hello, how are you?'],
    A1: ['Me=my|llamo=name is|Ana=Ana|y=and|vivo=I live|en=in|Madrid.=Madrid', 'My name is Ana and I live in Madrid.'],
    A2: ['Ayer=yesterday|fui=I went|al=to the|mercado=market|y=and|compré=I bought|pan=bread|y=and|frutas.=fruit', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['Aunque=although|llovía,=it was raining|decidimos=we decided|salir=to go out|a=to|caminar=walk|porque=because|necesitábamos=we needed|aire fresco.=fresh air', 'Although it was raining, we decided to go for a walk because we needed fresh air.'],
    B2: ['Si hubiera sabido=if I had known|lo difícil=how hard|que sería,=it would be|probablemente=probably|habría empezado=I would have started|mucho antes.=much earlier', 'If I had known how hard it would be, I would probably have started much earlier.'],
    C1: ['Lejos de=far from|resolver=solving|el problema,=the problem|la medida=the measure|no hizo sino=did nothing but|agravar=worsen|la desconfianza=the mistrust|que pretendía=it aimed|disipar.=to dispel', 'Far from solving the problem, the measure only deepened the mistrust it was meant to dispel.'],
  },
  fr: {
    A0: ['Bonjour,=hello|comment=how|ça va ?=is it going', 'Hello, how are you?'],
    A1: ['Je m’appelle=my name is|Ana=Ana|et=and|j’habite=I live|à=in|Paris.=Paris', 'My name is Ana and I live in Paris.'],
    A2: ['Hier,=yesterday|je suis allé=I went|au=to the|marché=market|et=and|j’ai acheté=I bought|du pain=bread|et=and|des fruits.=fruit', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['Même s’il pleuvait,=even though it was raining|nous avons décidé=we decided|de marcher=to walk|un peu=a little|parce que=because|nous avions besoin=we needed|d’air.=some air', 'Even though it was raining, we decided to walk a little because we needed some air.'],
    B2: ['Si j’avais su=if I had known|à quel point=how|ce serait difficile,=hard it would be|j’aurais probablement commencé=I would probably have started|bien plus tôt.=much earlier', 'If I had known how hard it would be, I would probably have started much earlier.'],
    C1: ['Loin de=far from|résoudre=solving|le problème,=the problem|cette mesure=this measure|n’a fait qu’aggraver=only worsened|la méfiance=the mistrust|qu’elle prétendait=it claimed|dissiper.=to dispel', 'Far from solving the problem, this measure only deepened the mistrust it claimed to dispel.'],
  },
  de: {
    A0: ['Hallo,=hello|wie geht’s?=how are you', 'Hello, how are you?'],
    A1: ['Ich heiße=my name is|Ana=Ana|und=and|wohne=live|in Berlin.=in Berlin', 'My name is Ana and I live in Berlin.'],
    A2: ['Gestern=yesterday|war ich=I was|auf dem Markt=at the market|und=and|habe=have|Brot=bread|und=and|Obst=fruit|gekauft.=bought', 'Yesterday I was at the market and bought bread and fruit.'],
    B1: ['Obwohl=although|es regnete,=it rained|gingen wir=we went|spazieren,=for a walk|weil=because|wir=we|frische Luft=fresh air|brauchten.=needed', 'Although it was raining, we went for a walk because we needed fresh air.'],
    B2: ['Hätte ich gewusst,=had I known|wie schwierig=how hard|es werden würde,=it would be|hätte ich=I would have|wohl=probably|viel früher=much earlier|angefangen.=started', 'Had I known how hard it would be, I would probably have started much earlier.'],
    C1: ['Weit davon entfernt,=far from it|das Problem=the problem|zu lösen,=to solve|verstärkte=strengthened|die Maßnahme=the measure|nur=only|das Misstrauen,=the mistrust|das sie=that it|zerstreuen sollte.=was meant to dispel', 'Far from solving the problem, the measure only deepened the mistrust it was meant to dispel.'],
  },
  ru: {
    A0: ['Привет,=hi|как дела?=how are things', 'Hi, how are you?'],
    A1: ['Меня зовут=my name is|Ана,=Ana|я живу=I live|в Москве.=in Moscow', 'My name is Ana, I live in Moscow.'],
    A2: ['Вчера=yesterday|я ходил=I went|на рынок=to the market|и=and|купил=bought|хлеб=bread|и=and|фрукты.=fruit', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['Хотя=although|шёл дождь,=it was raining|мы решили=we decided|погулять,=to take a walk|потому что=because|нам нужен был=we needed|свежий воздух.=fresh air', 'Although it was raining, we decided to go for a walk because we needed fresh air.'],
    B2: ['Если бы я знал,=if I had known|как=how|это трудно,=hard it is|я бы,=I would|наверное,=probably|начал=have started|гораздо раньше.=much earlier', 'If I had known how hard it was, I would probably have started much earlier.'],
    C1: ['Эта мера=this measure|не только=not only|не решила=did not solve|проблему,=the problem|но и усилила=but also strengthened|недоверие,=the mistrust|которое=that|должна была развеять.=it was meant to dispel', 'This measure not only failed to solve the problem but deepened the mistrust it was meant to dispel.'],
  },
  ar: {
    A0: ['مرحبا،=hello|كيف حالك؟=how are you', 'Hello, how are you?'],
    A1: ['اسمي=my name|آنا=Ana|وأسكن=and I live|في القاهرة.=in Cairo', 'My name is Ana and I live in Cairo.'],
    A2: ['ذهبت=I went|أمس=yesterday|إلى السوق=to the market|واشتريت=and I bought|خبزًا=bread|وفاكهة.=and fruit', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['رغم أن=although|المطر=the rain|كان ينهمر،=was pouring|قررنا=we decided|أن نتمشى=to walk|لأننا=because we|احتجنا=needed|إلى هواء نقي.=fresh air', 'Although the rain was pouring, we decided to take a walk because we needed fresh air.'],
    B2: ['لو كنت أعلم=if I had known|كم=how|سيكون الأمر=it would be|صعبًا،=hard|لربما=perhaps|بدأت=I would have started|قبل ذلك بكثير.=much earlier', 'If I had known how hard it would be, I might have started much earlier.'],
    C1: ['بدلًا من=instead of|حلّ المشكلة،=solving the problem|لم يزد=did not add|القرار=the decision|إلا تعميقًا=except deepening|لانعدام الثقة=the lack of trust|الذي كان يُراد تبديده.=that was meant to be dispelled', 'Instead of solving the problem, the decision only deepened the mistrust it was meant to dispel.'],
  },
  zh: {
    A0: ['你好，=hello|你好吗？=how are you', 'Hello, how are you?'],
    A1: ['我叫=my name is|安娜，=Ana|我=I|住在=live in|北京。=Beijing', 'My name is Ana and I live in Beijing.'],
    A2: ['昨天=yesterday|我=I|去了=went to|市场，=the market|买了=bought|面包=bread|和=and|水果。=fruit', 'Yesterday I went to the market and bought bread and fruit.'],
    B1: ['虽然=although|下着雨，=it was raining|我们=we|还是=still|决定=decided|出去走走，=to go out for a walk|因为=because|需要=needed|新鲜空气。=fresh air', 'Although it was raining, we still decided to go out for a walk because we needed fresh air.'],
    B2: ['如果=if|早知道=I had known|这么难，=it was this hard|我=I|大概会=would probably|早点=earlier|开始。=start', 'If I had known it was this hard, I would probably have started earlier.'],
    C1: ['这项措施=this measure|非但没有=not only did not|解决问题，=solve the problem|反而=but instead|加深了=deepened|它本想消除的=that it meant to remove|不信任。=the mistrust', 'Far from solving the problem, the measure deepened the very mistrust it set out to remove.'],
  },
};

/** The level's example in a language, for the six core languages. */
export const levelExample = (lang: string, level: Level): LevelExample | undefined => {
  const raw = RAW[lang]?.[level];
  return raw && parse(raw[0], raw[1]);
};
export const LEVEL_EXAMPLE_LANGS = Object.keys(RAW);
