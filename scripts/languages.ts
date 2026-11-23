/**
 * Languages of the entries and the fixed section titles of each one. French is the source language of the
 * encyclopedia; the other languages are translations, one file per entry in `entries/<lang>/` (see README.md).
 */
export const LANGUAGES = [
  'fr',
  'en',
  'es',
  'de',
  'it',
  'pt',
  'nl',
  'pl',
  'ro',
  'ru',
  'uk',
  'tr',
  'ar',
  'hi',
  'id',
  'ja',
  'ko',
  'zh'
] as const;

export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export interface SectionTitles {
  /** Biases, techniques, fallacies and devices: one section per pillar (understand, detect, protect). */
  phenomenon: readonly [string, string, string, string];
  /** Indicators add how to respond. */
  respond: string;
  concept: readonly [string, string, string];
  /** Opening of the paragraph that states what kind of statement a law or adage is. */
  status: string;
}

export const SECTION_TITLES: Readonly<Record<Language, SectionTitles>> = {
  fr: {
    phenomenon: ['Comment ça marche', "Pourquoi c'est problématique", 'Comment le détecter', "Comment s'en protéger"],
    respond: 'Comment réagir',
    concept: ['Définition', 'Définitions concurrentes et débats', 'Pourquoi cela aide à discerner'],
    status: 'Statut :'
  },
  en: {
    phenomenon: ['How it works', 'Why it is problematic', 'How to detect it', 'How to protect yourself'],
    respond: 'How to respond',
    concept: ['Definition', 'Competing definitions and debates', 'Why it helps to discern'],
    status: 'Status:'
  },
  es: {
    phenomenon: ['Cómo funciona', 'Por qué es problemático', 'Cómo detectarlo', 'Cómo protegerse'],
    respond: 'Cómo reaccionar',
    concept: ['Definición', 'Definiciones en competencia y debates', 'Por qué ayuda a discernir'],
    status: 'Estatus:'
  },
  de: {
    phenomenon: ['Wie es funktioniert', 'Warum es problematisch ist', 'Wie man es erkennt', 'Wie man sich schützt'],
    respond: 'Wie man reagiert',
    concept: ['Definition', 'Konkurrierende Definitionen und Debatten', 'Warum es beim Unterscheiden hilft'],
    status: 'Status:'
  },
  it: {
    phenomenon: ['Come funziona', 'Perché è problematico', 'Come riconoscerlo', 'Come proteggersi'],
    respond: 'Come reagire',
    concept: ['Definizione', 'Definizioni concorrenti e dibattiti', 'Perché aiuta a discernere'],
    status: 'Statuto:'
  },
  pt: {
    phenomenon: ['Como funciona', 'Porque é problemático', 'Como detetá-lo', 'Como se proteger'],
    respond: 'Como reagir',
    concept: ['Definição', 'Definições concorrentes e debates', 'Porque ajuda a discernir'],
    status: 'Estatuto:'
  },
  nl: {
    phenomenon: ['Hoe het werkt', 'Waarom het problematisch is', 'Hoe je het herkent', 'Hoe je je beschermt'],
    respond: 'Hoe je reageert',
    concept: ['Definitie', 'Concurrerende definities en debatten', 'Waarom het helpt om te onderscheiden'],
    status: 'Status:'
  },
  pl: {
    phenomenon: ['Jak to działa', 'Dlaczego to problem', 'Jak to rozpoznać', 'Jak się chronić'],
    respond: 'Jak reagować',
    concept: ['Definicja', 'Konkurencyjne definicje i spory', 'Dlaczego pomaga rozróżniać'],
    status: 'Status:'
  },
  ro: {
    phenomenon: ['Cum funcționează', 'De ce este problematic', 'Cum îl recunoști', 'Cum te protejezi'],
    respond: 'Cum să reacționezi',
    concept: ['Definiție', 'Definiții concurente și dezbateri', 'De ce ajută la discernământ'],
    status: 'Statut:'
  },
  ru: {
    phenomenon: ['Как это работает', 'Почему это проблема', 'Как это распознать', 'Как защититься'],
    respond: 'Как реагировать',
    concept: ['Определение', 'Конкурирующие определения и споры', 'Почему это помогает различать'],
    status: 'Статус:'
  },
  uk: {
    phenomenon: ['Як це працює', 'Чому це проблема', 'Як це розпізнати', 'Як захиститися'],
    respond: 'Як реагувати',
    concept: ['Визначення', 'Конкурентні визначення та дискусії', 'Чому це допомагає розрізняти'],
    status: 'Статус:'
  },
  tr: {
    phenomenon: ['Nasıl işler', 'Neden sorunludur', 'Nasıl fark edilir', 'Nasıl korunulur'],
    respond: 'Nasıl tepki verilir',
    concept: ['Tanım', 'Rakip tanımlar ve tartışmalar', 'Ayırt etmeye neden yardımcı olur'],
    status: 'Statü:'
  },
  ar: {
    phenomenon: ['كيف يعمل', 'لماذا يطرح مشكلة', 'كيف نكتشفه', 'كيف نحمي أنفسنا منه'],
    respond: 'كيف نتصرّف',
    concept: ['التعريف', 'تعريفات متنافسة ونقاشات', 'لماذا يساعد على التمييز'],
    status: 'الطبيعة:'
  },
  hi: {
    phenomenon: ['यह कैसे काम करता है', 'यह समस्या क्यों है', 'इसे कैसे पहचानें', 'इससे कैसे बचें'],
    respond: 'कैसे प्रतिक्रिया दें',
    concept: ['परिभाषा', 'प्रतिस्पर्धी परिभाषाएँ और बहसें', 'यह विवेक में कैसे मदद करता है'],
    status: 'स्थिति:'
  },
  id: {
    phenomenon: ['Cara kerjanya', 'Mengapa ini bermasalah', 'Cara mengenalinya', 'Cara melindungi diri'],
    respond: 'Cara menanggapinya',
    concept: ['Definisi', 'Definisi yang bersaing dan perdebatan', 'Mengapa ini membantu membedakan'],
    status: 'Status:'
  },
  ja: {
    phenomenon: ['仕組み', 'なぜ問題なのか', '見抜き方', '身の守り方'],
    respond: '対応のしかた',
    concept: ['定義', '対立する定義と論争', '見分ける助けになる理由'],
    status: '位置づけ：'
  },
  ko: {
    phenomenon: ['작동 방식', '왜 문제인가', '알아차리는 법', '스스로를 지키는 법'],
    respond: '대응하는 법',
    concept: ['정의', '경쟁하는 정의와 논쟁', '분별에 도움이 되는 이유'],
    status: '성격:'
  },
  zh: {
    phenomenon: ['运作方式', '为什么有问题', '如何识别', '如何自我保护'],
    respond: '如何应对',
    concept: ['定义', '相互竞争的定义与争论', '为什么有助于辨别'],
    status: '性质：'
  }
};
