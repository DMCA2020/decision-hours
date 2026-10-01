/*
  Group content. Edit this file to change the group.

  members: id -> { name, color, g: 'f'|'m' (for Hebrew verb forms), phone? (shown when not a saved contact) }
  "me" is the viewer. Their messages appear on the outgoing side with ticks.

  history: shown instantly on load (older messages with fixed times).
  scenes:  played live, one after the other, then loop forever.

  Step types:
    { from, text }                         text message (1-3 emoji alone = big emoji)
    { from, text, id }                     give it an id so others can reply/react/edit/delete it
    { from, text, reply: 'id' }            quoted reply
    { from, type:'image', src, text? }     image with optional caption
    { from, type:'voice', dur:'0:23' }     voice note
    { from, type:'poll', id, q, options:[...] }
    { type:'vote', to:'pollId', from, option: 0 }
    { type:'react', to:'id', from, emoji }
    { type:'edit', to:'id', text }
    { type:'delete', to:'id' }
    { type:'system', text }                yellow system line (joined, left, name changed)
    { type:'date', text }                  date chip
    wait: ms                               optional pause before this step (default random 1.5 to 4 s)
*/

(function () {
  // small inline illustrations so the site works offline; replace src with any image URL
  function pic(a, b, emoji, label) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="640" height="480" fill="url(#g)"/>` +
      `<circle cx="520" cy="90" r="60" fill="#fff" opacity=".25"/>` +
      `<path d="M0 380 Q160 300 320 370 T640 350 V480 H0Z" fill="#000" opacity=".12"/>` +
      `<text x="320" y="270" font-size="170" text-anchor="middle">${emoji}</text>` +
      (label ? `<text x="320" y="420" font-size="34" font-family="Arial" font-weight="700" fill="#fff" text-anchor="middle">${label}</text>` : '') +
      `</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  window.GROUP = {
    name: "הורים ד'2 🏫",
    avatar: '🏫',
    avatarBg: '#f0b429',
    meGender: 'f',

    members: {
      me:    { name: 'את/ה',          color: '#00a884', g: 'f' },
      einat: { name: 'עינת המחנכת',   color: '#1f7aec', g: 'f' },
      dana:  { name: 'דנה (אמא של יואב)', color: '#e542a3', g: 'f' },
      yossi: { name: 'יוסי',          color: '#c4532d', g: 'm' },
      michal:{ name: 'מיכל',          color: '#5e47de', g: 'f' },
      avi:   { name: 'אבי כהן',       color: '#029d00', g: 'm' },
      ronit: { name: 'רונית',         color: '#d3396d', g: 'f' },
      galit: { name: 'גלית',        color: '#a62c71', g: 'f', phone: '+972 52-418-3390' },
      moshe: { name: 'משה (אבא של נועה)', color: '#128c7e', g: 'm' }
    },

    history: [
      { type: 'lock' },
      { type: 'date', text: 'אתמול' },
      { from: 'einat', time: '16:02', text: 'ערב טוב הורים יקרים 🌷\nמחר יום ספורט, הילדים מגיעים בבגדי ספורט ועם בקבוק מים.' },
      { from: 'dana',  time: '16:05', text: 'תודה עינת!' },
      { from: 'avi',   time: '16:11', text: 'תודה 🙏' },
      { from: 'ronit', time: '19:47', text: 'מישהו יודע מה היה שיעורי בית בחשבון? יואב אומר שלא היה 😅', id: 'h1' },
      { from: 'michal',time: '19:52', text: 'עמוד 42 תרגילים 1 עד 6', reply: 'h1' },
      { from: 'ronit', time: '19:53', text: 'את מלאך ❤️' },
      { from: 'me',    time: '21:30', text: 'לילה טוב לכולם 🌙' }
    ],

    scenes: [
      [
        { type: 'date', text: 'היום', wait: 600 },
        { from: 'einat', id: 'trip', wait: 1200,
          text: 'בוקר טוב הורים יקרים ☀️\nתזכורת: ביום חמישי טיול שנתי ליער בן שמן.\nיציאה ב-7:45 מבית הספר, בבקשה לא לאחר 🚌' },
        { type: 'react', to: 'trip', from: 'dana', emoji: '👍', wait: 1200 },
        { from: 'dana', text: 'תודה עינת 🙏' },
        { type: 'react', to: 'trip', from: 'avi', emoji: '👍', wait: 800 },
        { from: 'michal', id: 'bring', text: 'מה צריך להביא?' },
        { from: 'einat', reply: 'bring', text: 'כובע, 2 בקבוקי מים, ארוחת בוקר, נעליים סגורות 👟\nבלי ממתקים בבקשה' },
        { type: 'react', to: 'trip', from: 'ronit', emoji: '❤️', wait: 600 },
        { from: 'avi', type: 'voice', dur: '0:23' },
        { from: 'ronit', id: 'phone', text: 'אפשר לשלוח טלפון? נועם בלי טלפון לא זז 🙈' },
        { from: 'dana', reply: 'phone', text: 'בשנה שעברה אמרו שלא, רק שעון' },
        { from: 'einat', reply: 'phone', text: 'נכון, בלי טלפונים. יש לנו מספיק מלווים 😊' },
        { type: 'react', to: 'phone', from: 'ronit', emoji: '😂' },
        { from: 'yossi', type: 'image', id: 'coat', src: pic('#6a8caf', '#2c4a6e', '🧥', ''),
          text: 'מישהו מכיר את המעיל הזה? נשאר אצלנו אחרי יום ההולדת בשבת' },
        { from: 'michal', reply: 'coat', text: 'זה של עומר! אני אגיד לאמא שלו' },
        { type: 'react', to: 'coat', from: 'yossi', emoji: '🙏' },
        { from: 'ronit', text: '😂😂😂' },
        { type: 'system', text: 'אבי כהן הוסיף/ה את +972 52-418-3390' },
        { from: 'galit', text: 'היי לכולם! אני גלית, אמא של שירה החדשה 😊 תודה שצירפתם' },
        { from: 'dana', text: 'ברוכה הבאה גלית!! 🌸' },
        { from: 'michal', text: 'ברוכה הבאה 💐' },
        { from: 'me', text: 'ברוכה הבאה גלית, איזה כיף שהצטרפתן 🌸' },
        { type: 'react', to: '__last', from: 'galit', emoji: '❤️' },
        { from: 'yossi', id: 'oops', text: 'אהובה אל תשכחי לקנות חלב ולחם' },
        { from: 'moshe', text: '😂' },
        { type: 'delete', to: 'oops', wait: 1400 },
        { from: 'yossi', text: 'סליחה קבוצה לא נכונה 🤦‍♂️' },
        { from: 'ronit', text: 'יוסי תקנה גם ביצים 🥚😂' },
        { type: 'react', to: '__last', from: 'dana', emoji: '😂' },
        { type: 'react', to: '__last', from: 'avi', emoji: '😂' }
      ],
      [
        { from: 'dana', id: 'gift', wait: 5000,
          text: 'מזכירה לכולם: אוספים 30 ₪ למתנה לעינת לסוף השנה 🎁\nאפשר בביט אליי 050-7721843' },
        { from: 'dana', type: 'poll', id: 'p1', q: 'מה קונים לעינת?',
          options: ['שובר לספא 💆‍♀️', 'אלבום תמונות מהכיתה 📸', 'עציץ + כרטיס מכל הילדים 🪴'] },
        { type: 'vote', to: 'p1', from: 'michal', option: 1, wait: 1500 },
        { type: 'vote', to: 'p1', from: 'avi', option: 0, wait: 900 },
        { type: 'vote', to: 'p1', from: 'ronit', option: 1, wait: 1100 },
        { from: 'ronit', text: 'אלבום!! היא תבכה 😭' },
        { type: 'vote', to: 'p1', from: 'moshe', option: 1, wait: 700 },
        { type: 'vote', to: 'p1', from: 'galit', option: 2, wait: 900 },
        { from: 'avi', id: 'paid', text: 'העברתי 👍' },
        { type: 'edit', to: 'paid', text: 'העברתי 30 ₪ 👍', wait: 2500 },
        { type: 'vote', to: 'p1', from: 'yossi', option: 1, wait: 800 },
        { from: 'moshe', text: 'גם אני העברתי' },
        { from: 'einat', wait: 6000, text: 'רגע, אני בקבוצה הזאת 😅😅' },
        { from: 'dana', text: '🙈🙈🙈' },
        { from: 'michal', text: 'אוקיי אז... הפתעה!! 🎉' },
        { type: 'react', to: '__last', from: 'einat', emoji: '❤️' },
        { from: 'einat', text: 'אתם מתוקים, לא צריך שום דבר ❤️\nנתראה ביום חמישי בטיול!' },
        { type: 'system', text: 'דנה (אמא של יואב) יצר/ה את הקבוצה "מתנה לעינת 🤫"', wait: 3000 }
      ],
      [
        { from: 'michal', wait: 8000, type: 'image', src: pic('#88c057', '#2e7d32', '🌳', 'יער בן שמן'),
          text: 'ככה נראה המסלול, יפה! 😍' },
        { from: 'avi', text: 'מהמם' },
        { from: 'galit', id: 'q2', text: 'שאלה, איסוף בסוף היום מבית הספר או מהחניה?' },
        { from: 'einat', reply: 'q2', text: 'מבית הספר, בערך ב-13:30. אעדכן כאן כשנצא לדרך חזרה' },
        { from: 'galit', text: 'תודה רבה!' },
        { from: 'moshe', type: 'voice', dur: '0:41' },
        { from: 'ronit', text: 'משה אני לא מצליחה לשמוע, אפשר בכתב? 😅' },
        { from: 'moshe', text: 'אמרתי שאני יכול להסיע 3 ילדים הביתה אם צריך 🚗' },
        { type: 'react', to: '__last', from: 'ronit', emoji: '🙏' },
        { type: 'react', to: '__last', from: 'galit', emoji: '🙏' },
        { from: 'me', text: 'תודה משה! שירה ונועה יכולות איתך?' },
        { from: 'moshe', text: 'בשמחה 👍' }
      ]
    ],

    // when the viewer types a message, someone answers from this pool
    autoReplies: [
      { from: 'dana', text: '👍' },
      { from: 'ronit', text: 'חחחח מסכימה' },
      { from: 'michal', text: 'תודה על העדכון 🙏' },
      { from: 'avi', text: 'סבבה' },
      { from: 'yossi', text: '💯' },
      { from: 'galit', text: 'מעולה ❤️' }
    ]
  };
})();
