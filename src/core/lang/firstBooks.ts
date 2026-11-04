// A first book for a complete beginner (Lemora U1): one tiny original story per course language, a line a page, in the
// few dozen words a first week needs (this, small, big, night, moon, hello, good night). Written for Lingua and Lemora.
import type { SampleText } from './samples';

export const FIRST_BOOKS: Record<string, SampleText> = {
  en: { title: 'The Cat and the Moon', paragraphs: ['This is a cat.', 'The cat is small.', 'The cat is black.', 'It is night.', 'Look, the moon!', 'The moon is big.', 'The moon is white.', 'The cat looks at the moon.', 'The moon looks at the cat.', '“Hello, moon,” says the cat.', 'The cat is sleepy.', 'Good night, cat. Good night, moon.'] },
  es: { title: 'El gato y la luna', paragraphs: ['Esto es un gato.', 'El gato es pequeño.', 'El gato es negro.', 'Es de noche.', '¡Mira, la luna!', 'La luna es grande.', 'La luna es blanca.', 'El gato mira la luna.', 'La luna mira al gato.', '—Hola, luna —dice el gato.', 'El gato tiene sueño.', 'Buenas noches, gato. Buenas noches, luna.'] },
  fr: { title: 'Le chat et la lune', paragraphs: ['Voici un chat.', 'Le chat est petit.', 'Le chat est noir.', 'C’est la nuit.', 'Regarde, la lune !', 'La lune est grande.', 'La lune est blanche.', 'Le chat regarde la lune.', 'La lune regarde le chat.', '« Bonjour, la lune », dit le chat.', 'Le chat a sommeil.', 'Bonne nuit, le chat. Bonne nuit, la lune.'] },
  de: { title: 'Die Katze und der Mond', paragraphs: ['Das ist eine Katze.', 'Die Katze ist klein.', 'Die Katze ist schwarz.', 'Es ist Nacht.', 'Schau, der Mond!', 'Der Mond ist groß.', 'Der Mond ist weiß.', 'Die Katze sieht den Mond.', 'Der Mond sieht die Katze.', '„Hallo, Mond“, sagt die Katze.', 'Die Katze ist müde.', 'Gute Nacht, Katze. Gute Nacht, Mond.'] },
  ru: { title: 'Кот и луна', paragraphs: ['Это кот.', 'Кот маленький.', 'Кот чёрный.', 'Сейчас ночь.', 'Смотри, луна!', 'Луна большая.', 'Луна белая.', 'Кот смотрит на луну.', 'Луна смотрит на кота.', '«Привет, луна», — говорит кот.', 'Кот хочет спать.', 'Спокойной ночи, кот. Спокойной ночи, луна.'] },
  zh: { title: '小猫和月亮', paragraphs: ['这是一只小猫。', '小猫很小。', '小猫是黑色的。', '现在是晚上。', '看，月亮！', '月亮很大。', '月亮是白色的。', '小猫看月亮。', '月亮看小猫。', '小猫说：“月亮，你好！”', '小猫想睡觉了。', '小猫，晚安。月亮，晚安。'] },
  ar: { title: 'القطّ والقمر', paragraphs: ['هذا قطّ.', 'القطّ صغير.', 'القطّ أسود.', 'إنّه الليل.', 'انظر، القمر!', 'القمر كبير.', 'القمر أبيض.', 'القطّ ينظر إلى القمر.', 'القمر ينظر إلى القطّ.', 'يقول القطّ: «مرحبًا يا قمر».', 'القطّ نعسان.', 'تصبح على خير يا قطّ. تصبح على خير يا قمر.'] },
};
