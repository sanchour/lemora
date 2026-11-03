// The weekly challenge's topics (6-21, F1216): 52, one for each week of the year, found in the language's own word list by what each word's meaning says.
// A word belongs to a topic when its meaning has one of the topic's words in it. A topic a language's list has too few words for is passed over.
import type { ListWord } from './daily';

export interface Topic {
  id: string;
  label: string;
  /** Whole words of an English meaning. */
  words: string[];
}

const T = (label: string, words: string): Topic => ({ id: label.toLowerCase().replace(/[^a-z]+/g, '-'), label, words: words.split(/\s+/) });

export const TOPICS: Topic[] = [
  T('Animals', 'animal dog cat horse cow pig sheep goat mouse rabbit wolf bear lion tiger monkey elephant deer fox'),
  T('Food', 'food bread meat rice cheese egg soup fruit vegetable apple salt sugar cake butter meal dinner lunch breakfast'),
  T('Drinks', 'drink water wine beer milk tea coffee juice thirst'),
  T('Family', 'father mother brother sister son daughter child parent family uncle aunt grandfather grandmother husband wife baby'),
  T('The body', 'body head hand arm leg foot eye ear nose mouth heart face hair finger tooth skin back neck shoulder'),
  T('Clothes', 'clothes dress shirt shoe hat coat trousers skirt sock glove wear pocket'),
  T('Colours', 'colour color red blue green yellow black white brown grey gray pink orange purple'),
  T('Numbers', 'one two three four five six seven eight nine ten hundred thousand number half first second third'),
  T('Time', 'time day night hour minute week month year morning evening today tomorrow yesterday season clock early late'),
  T('Weather', 'weather rain snow wind cloud sun storm cold hot warm fog ice thunder'),
  T('The home', 'house home room door window wall roof floor kitchen bedroom bathroom stairs garden key'),
  T('Furniture', 'table chair bed sofa desk shelf lamp mirror carpet cupboard'),
  T('School', 'school teacher student lesson class book exam learn study pupil university homework'),
  T('Work', 'work job office boss company business factory salary worker employ'),
  T('Jobs', 'doctor nurse teacher driver farmer cook baker lawyer police soldier engineer artist singer waiter worker'),
  T('Travel', 'travel journey trip tourist hotel ticket passport luggage map visit holiday'),
  T('Transport', 'car bus train plane ship boat bicycle bike road station airport taxi truck ticket'),
  T('The city', 'city town street square shop market bridge church building village park museum'),
  T('Nature', 'nature mountain river forest lake hill valley field stone sand earth island wood'),
  T('Plants', 'plant tree flower grass leaf root seed rose fruit wood'),
  T('The sea', 'sea ocean beach wave fish shore sail swim coast water'),
  T('Sport', 'sport game play ball team race run win football match player swim'),
  T('Music', 'music song sing dance instrument piano guitar drum voice band sound'),
  T('Art', 'art paint picture draw colour artist painting sculpture photo theatre film'),
  T('Health', 'health ill sick pain medicine hospital doctor disease cure fever healthy tired'),
  T('Feelings', 'feel happy sad angry afraid fear love hate joy anger surprise shy proud worry'),
  T('People', 'man woman boy girl person people friend neighbour stranger guest enemy lady'),
  T('Shopping', 'buy sell shop price cheap expensive pay cost money customer bag market'),
  T('Money', 'money coin bank rich poor pay price debt tax cash wealth gold silver'),
  T('Talking', 'say speak tell ask answer talk word voice call shout whisper language question'),
  T('Technology', 'computer telephone phone machine engine electric radio television battery wire signal'),
  T('Tools', 'tool knife hammer saw rope needle nail axe key brush spoon fork'),
  T('The kitchen', 'kitchen cook pot pan plate cup glass bowl spoon fork knife oven boil fry bake'),
  T('The garden', 'garden grass fence gate soil water flower tree dig plant'),
  T('The farm', 'farm farmer field crop harvest cow sheep horse tractor barn wheat corn'),
  T('Belief', 'god church pray religion holy soul spirit faith heaven angel sin priest'),
  T('The law', 'law court judge police crime prison guilty rule right justice lawyer thief'),
  T('The state', 'government country nation king queen president minister vote state party power citizen'),
  T('Conflict', 'war fight army soldier weapon enemy battle peace gun attack defend'),
  T('Science', 'science experiment law theory scientist research discover element energy atom measure'),
  T('Maths', 'number count add plus minus line circle square half equal sum divide multiply'),
  T('The land', 'land country border region north south east west map area coast continent'),
  T('Directions', 'left right up down near far north south east west straight turn behind front inside outside'),
  T('Materials', 'wood stone iron metal glass paper gold silver cotton wool plastic leather steel cloth'),
  T('Shapes', 'circle square round line point shape corner edge flat straight curve triangle'),
  T('Sizes', 'big small large little long short tall high low wide narrow thick thin heavy light'),
  T('Moving', 'go come run walk jump fall climb move enter leave arrive return fly push pull carry'),
  T('Light and dark', 'light dark bright shadow lamp candle shine sun moon star fire black'),
  T('Sound', 'sound noise loud quiet silent hear listen voice bell music scream whisper'),
  T('Fire and water', 'fire water flame burn smoke ash wet dry flood drop steam ice'),
  T('Birds and insects', 'bird wing feather fly bee insect egg nest chicken duck owl butterfly ant'),
  T('Qualities', 'good bad beautiful ugly clean dirty strong weak kind brave clever lazy rich poor new old young'),
];

const tokens = (gloss: string): string[] => gloss.toLowerCase().split(/[^a-z]+/).filter(Boolean);

/** The words of the list whose meaning has one of the topic's words in it. */
export function topicWords(list: ListWord[], topic: Topic): ListWord[] {
  const keys = new Set(topic.words);
  return list.filter((w) => w.gloss && tokens(w.gloss).some((t) => keys.has(t)));
}

/** The topic of a week of the year (1 to 53): the one at that place in the list, or the next that the list has at least `min` words for. */
export function topicOfWeek(list: ListWord[], week: number, min = 12): { topic: Topic; words: ListWord[] } | null {
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[(week - 1 + i) % TOPICS.length];
    const words = topicWords(list, topic);
    if (words.length >= min) return { topic, words };
  }
  return null;
}
