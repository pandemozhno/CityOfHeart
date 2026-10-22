// ── Данные игры ──

const VIRTUES = [
  // 🔵 Разум (синий)
  { id:'sidq',   name:'Правдивость', arabic:'صدق',   light:2, quarter:'razum' },
  { id:'ilm',    name:'Знание',      arabic:'علم',   light:2, quarter:'razum' },
  { id:'hikma',  name:'Мудрость',    arabic:'حكمة',  light:3, quarter:'razum' },
  // 🔴 Гнев (красный)
  { id:'sabr',   name:'Терпение',    arabic:'صبر',   light:2, quarter:'gnev' },
  { id:'tawadu', name:'Смирение',    arabic:'تواضع', light:2, quarter:'gnev' },
  { id:'hilm',   name:'Кротость',    arabic:'حلم',   light:3, quarter:'gnev' },
  // 🟠 Желание (оранжевый)
  { id:'shukr',  name:'Благодарность', arabic:'شكر', light:2, quarter:'zhelanie' },
  { id:'tawakkul',name:'Упование',   arabic:'توكل',  light:3, quarter:'zhelanie' },
  { id:'wara',   name:'Воздержание', arabic:'ورع',   light:2, quarter:'zhelanie' },
  // 🟣 Воображение (фиолетовый)
  { id:'ikhlas', name:'Искренность', arabic:'إخلاص', light:3, quarter:'voobrazhenie' },
  { id:'zikr',   name:'Память',      arabic:'ذكر',   light:2, quarter:'voobrazhenie' },
  { id:'raja',   name:'Надежда',     arabic:'رجاء',  light:2, quarter:'voobrazhenie' }
];

const TEMPTATIONS = [
  // Разум
  { name:'Гордыня',        arabic:'كِبر', power:3, quarter:'razum',        desc:'Мысль, что ты лучше других' },
  { name:'Тщеславие',      arabic:'رياء', power:4, quarter:'razum',        desc:'Показная праведность' },
  { name:'Отчаяние',       arabic:'يأس',  power:4, quarter:'razum',        desc:'Потеря надежды' },
  // Гнев
  { name:'Гнев',           arabic:'غضب',  power:4, quarter:'gnev',         desc:'Ярость, требующая выхода' },
  { name:'Жестокость',     arabic:'قسوة', power:4, quarter:'gnev',         desc:'Черствость сердца' },
  { name:'Уныние',         arabic:'هم',   power:3, quarter:'gnev',         desc:'Тяжесть на сердце' },
  // Желание
  { name:'Зависть',        arabic:'حسد',  power:4, quarter:'zhelanie',     desc:'Желание чужого блага' },
  { name:'Сребролюбие',    arabic:'طمع',  power:3, quarter:'zhelanie',     desc:'Жажда наживы' },
  { name:'Похоть',         arabic:'شهوة', power:3, quarter:'zhelanie',     desc:'Слепая страсть' },
  // Воображение
  { name:'Мечтательность', arabic:'خيال', power:2, quarter:'voobrazhenie', desc:'Уход в иллюзии' },
  { name:'Сомнение',       arabic:'شك',   power:3, quarter:'voobrazhenie', desc:'Подтачивает веру' },
  { name:'Лень',           arabic:'كسل',  power:2, quarter:'voobrazhenie', desc:'Уклонение от усилия' }
];

const QUARTER_NAMES = {
  razum:'Разум', gnev:'Гнев', zhelanie:'Желание', voobrazhenie:'Воображение'
};

const QUARTER_COLORS = {
  razum:        { name:'синий',      hex:'#7aaac8' },
  gnev:         { name:'красный',    hex:'#c87070' },
  zhelanie:     { name:'оранжевый',  hex:'#c8a070' },
  voobrazhenie: { name:'фиолетовый', hex:'#a07ac8' }
};

// Эффективный свет: полный при совпадении цвета, −1 иначе
function effectiveLight(card, quarter) {
  if (!card) return 0;
  if (!quarter || card.quarter === quarter) return card.light;
  return Math.max(0, card.light - 1);
}

// Баланс (сжатая экономика)
const HAND_LIMIT = 8;         // лимит руки
const START_HAND = 4;         // стартовая рука
const CARD_PER_CYCLE = 1;     // доход в начале цикла
const CARD_ON_SUCCESS = 1;    // награда за точное отбитие

// Очки Действия
const START_AP = 3;
const AP_CARD = 1;
const AP_ACTION = 1;

// Сохранение
const SAVE_KEY = 'city-of-heart-save';
const SAVE_VERSION = 4;