import { AppFullState, Category, WordCard, Message, Note, WeekPlanData, PolaroidPhoto } from '../types';
import { getISOWeekKey } from './date';

const STORAGE_KEY = 'suyan_minimal_messenger_v1';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '日常问候', blocked: false, order: 1 },
  { id: 'cat-2', name: '所思随想', blocked: false, order: 2 },
  { id: 'cat-3', name: '应答知意', blocked: false, order: 3 },
  { id: 'cat-4', name: '短句絮语', blocked: false, order: 4 },
  { id: 'cat-5', name: '探询关切', blocked: false, order: 5 },
];

export const DEFAULT_CARDS: WordCard[] = [
  // 日常问候
  { id: 'c-1', category: '日常问候', text: '今天有好好吃饭吗？', blocked: false, createdAt: 1 },
  { id: 'c-2', category: '日常问候', text: '刚才突然想起你。', blocked: false, createdAt: 2 },
  { id: 'c-3', category: '日常问候', text: '窗外天色很静，风也很轻。', blocked: false, createdAt: 3 },
  { id: 'c-4', category: '日常问候', text: '忙完了，刚好看到你的消息。', blocked: false, createdAt: 4 },
  { id: 'c-5', category: '日常问候', text: '今天的茶很香，要是你在就好了。', blocked: false, createdAt: 5 },
  { id: 'c-6', category: '日常问候', text: '夜深了，早些休息。', blocked: false, createdAt: 6 },

  // 所思随想
  { id: 'c-7', category: '所思随想', text: '时间总是走得比预想中慢，又过得比回忆里快。', blocked: false, createdAt: 7 },
  { id: 'c-8', category: '所思随想', text: '有些话不一定要说完，停在沉默里刚刚好。', blocked: false, createdAt: 8 },
  { id: 'c-9', category: '所思随想', text: '慢慢来吧，世间万物皆有其时。', blocked: false, createdAt: 9 },
  { id: 'c-10', category: '所思随想', text: '保持清醒，也允许片刻的游离。', blocked: false, createdAt: 10 },
  { id: 'c-11', category: '所思随想', text: '独处的时候，整个宇宙好像都缩小了。', blocked: false, createdAt: 11 },

  // 应答知意
  { id: 'c-12', category: '应答知意', text: '确实如此。', blocked: false, createdAt: 12 },
  { id: 'c-13', category: '应答知意', text: '嗯，我也这么觉得。', blocked: false, createdAt: 13 },
  { id: 'c-14', category: '应答知意', text: '原来是这样。', blocked: false, createdAt: 14 },
  { id: 'c-15', category: '应答知意', text: '好像明白了。', blocked: false, createdAt: 15 },
  { id: 'c-16', category: '应答知意', text: '倒也不必勉强。', blocked: false, createdAt: 16 },
  { id: 'c-17', category: '应答知意', text: '听你这么说，倒觉得踏实了。', blocked: false, createdAt: 17 },

  // 短句絮语
  { id: 'c-18', category: '短句絮语', text: '在听呢。', blocked: false, createdAt: 18 },
  { id: 'c-19', category: '短句絮语', text: '稍等我一下。', blocked: false, createdAt: 19 },
  { id: 'c-20', category: '短句絮语', text: '收到。', blocked: false, createdAt: 20 },
  { id: 'c-21', category: '短句絮语', text: '有点意思。', blocked: false, createdAt: 21 },
  { id: 'c-22', category: '短句絮语', text: '笑了一下。', blocked: false, createdAt: 22 },

  // 探询关切
  { id: 'c-23', category: '探询关切', text: '你手头的事情忙完了吗？', blocked: false, createdAt: 23 },
  { id: 'c-24', category: '探询关切', text: '最近有什么新鲜事？', blocked: false, createdAt: 24 },
  { id: 'c-25', category: '探询关切', text: '要不要出去走走透透气？', blocked: false, createdAt: 25 },
  { id: 'c-26', category: '探询关切', text: '今天心情如何？', blocked: false, createdAt: 26 },
];

export const DEFAULT_NOTE_TAGS = ['随笔', '摘抄', '所思', '灵感', '闲录'];

export const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '素心如雪',
    content: '在喧嚣之隙，留一寸素简心境。\n言止于意，心会于微。不着一字，尽得风流。',
    tag: '随笔',
    pinned: true,
    solarTerm: '立冬',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'note-2',
    title: '山静似太古',
    content: '山静似太古，日长如小年。\n余花犹可醉，好鸟不妨眠。世味茶香淡，心闲云水宽。',
    tag: '摘抄',
    pinned: false,
    solarTerm: '立冬',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'note-3',
    title: '夜雨闲坐',
    content: '窗外风吹竹叶微响。泡一盏淡茶，将周内的待办逐一划去，心境自然澄澈。',
    tag: '闲录',
    pinned: false,
    solarTerm: '霜降',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
  },
];

const currentWeekKey = getISOWeekKey(new Date());

export const DEFAULT_WEEK_PLAN: WeekPlanData = {
  weekKey: currentWeekKey,
  days: {
    mon: [
      { id: 't-1', text: '整理字卡库分类与屏蔽规则', completed: true },
      { id: 't-2', text: '晨间独坐静思一刻钟', completed: true },
    ],
    tue: [
      { id: 't-3', text: '记录两则读书札记与时令随笔', completed: true },
      { id: 't-4', text: '整理手帐相册与随笔奏帖', completed: false },
    ],
    wed: [
      { id: 't-5', text: '清点周计划与目标打卡进度', completed: false },
      { id: 't-6', text: '试听并挑选新合成微音效', completed: false },
    ],
    thu: [
      { id: 't-7', text: '慢步林间，感受风露与草木清香', completed: false },
    ],
    fri: [
      { id: 't-8', text: '研读半卷书，归纳灵感至便签', completed: false },
    ],
    sat: [
      { id: 't-9', text: '断舍离杂乱事务，静心烹茶', completed: false },
    ],
    sun: [
      { id: 't-10', text: '回顾整周札记与目标达成周报', completed: false },
    ],
  },
  goals: [
    { id: 'g-1', title: '每日晨读或静坐15分钟', targetCount: 7, currentCount: 4, completed: false },
    { id: 'g-2', title: '收录精选新字卡', targetCount: 5, currentCount: 5, completed: true },
    { id: 'g-3', title: '完成本周手帐小记', targetCount: 3, currentCount: 2, completed: false },
  ],
  summaryNote: '心安即是归处。本周进展从容有度，继续保持素净清明。',
};

export const DEFAULT_POLAROIDS: PolaroidPhoto[] = [
  {
    id: 'p-1',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="%23222"><rect width="400" height="400" fill="%231a1a1a"/><circle cx="200" cy="170" r="70" fill="none" stroke="%23e5e5e5" stroke-width="2"/><path d="M60 320 Q 200 240 340 320" stroke="%23888" stroke-width="1.5" fill="none"/><line x1="200" y1="90" x2="200" y2="120" stroke="%23bbb" stroke-width="1.5"/></svg>',
    caption: '山峦如黛 · 独坐观微',
    dateStr: '二〇二六 · 霜降',
    tiltDeg: -1.8,
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'p-2',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="%231c1917"><rect width="400" height="400" fill="%23f5f5f4"/><rect x="80" y="80" width="240" height="240" fill="none" stroke="%2378716c" stroke-width="1.5"/><line x1="200" y1="80" x2="200" y2="320" stroke="%23a8a29e" stroke-width="1"/><line x1="80" y1="200" x2="320" y2="200" stroke="%23a8a29e" stroke-width="1"/><circle cx="200" cy="200" r="40" fill="%2344403c"/></svg>',
    caption: '素窗映月 · 几案微凉',
    dateStr: '二〇二六 · 立冬',
    tiltDeg: 1.5,
    timestamp: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    id: 'p-3',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="%23262626"><rect width="400" height="400" fill="%23262626"/><path d="M120 280 C 140 180, 260 180, 280 280" stroke="%23e7e5e4" stroke-width="2" fill="none"/><circle cx="200" cy="140" r="20" fill="%23a3a3a3"/></svg>',
    caption: '竹影清风 · 岁岁平安',
    dateStr: '二〇二六 · 孟冬',
    tiltDeg: -0.9,
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
  },
];

export const DEFAULT_INITIAL_STATE: AppFullState = {
  version: 2,
  cards: DEFAULT_CARDS,
  categories: DEFAULT_CATEGORIES,
  messages: [
    {
      id: 'init-msg-1',
      sender: 'bot',
      senderName: '林默',
      senderAvatar: '默',
      text: '你好。桌面上陈列着所有模块，点击即可进入。',
      timestamp: Date.now() - 1000 * 60 * 5,
      read: true,
    },
    {
      id: 'init-msg-2',
      sender: 'bot',
      senderName: '林默',
      senderAvatar: '默',
      text: '点击底部说话按钮，我便会自然回应你。',
      timestamp: Date.now() - 1000 * 60 * 2,
      read: true,
    },
  ],
  simulation: {
    delayMin: 1.5,
    delayMax: 3.5,
    proactiveEnabled: true,
    proactiveIntervalMin: 3,
    proactiveIntervalMax: 8,
    readWithoutReplyEnabled: false,
    readWithoutReplyRate: 20,
    quoteReplyEnabled: true,
    quoteReplyRate: 30,
    concatSentenceEnabled: true,
    concatSeparators: ['……', '，', ' —— ', ' / ', ' '],
    replyCountMin: 1,
    replyCountMax: 3,
    typingIndicatorText: '对方正在输入...',
  },
  appearance: {
    themeMode: 'system',
    showAvatar: true,
    showName: true,
    showTimestampDefault: false,
    showReadStatus: true,
    readStatusText: '已读',
    fontSize: 'md',
    fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", "STSong", serif',
    customFontUrl: '',
    customCss: '',
    bubbleStyle: 'minimal',
    chatBackground: '',
    homeLayout: 'dashboard',
    customBio: '见素抱朴 · 岁岁平安',
    customQuote: '言之所至，心之所安。在寂静处，与你对话。',
    appOrder: ['chat', 'cards', 'notes', 'planner', 'gallery', 'simulation', 'group', 'appearance', 'sound', 'backup'],
    dashboardStats: [
      { value: '未定义', label: '未定义' },
      { value: '未定义', label: '未定义' },
      { value: '未定义', label: '未定义' },
    ],
  },
  sound: {
    soundEnabled: true,
    randomSoundEnabled: true,
    presetSound: 'click',
    customSoundUrl: '',
    volume: 0.6,
    notificationEnabled: false,
  },
  group: {
    groupMode: false,
    partnerName: '自定义',
    partnerAvatar: ' ',
    groupMembers: [
      { id: 'm-1', name: '自定义', avatar: ' ', active: true, weight: 1 },
    ],
  },
  notes: DEFAULT_NOTES,
  noteTags: DEFAULT_NOTE_TAGS,
  weeklyPlans: {
    [currentWeekKey]: DEFAULT_WEEK_PLAN,
  },
  polaroids: DEFAULT_POLAROIDS,
  introSeen: false,
};

export function loadStoredState(): AppFullState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_INITIAL_STATE,
      ...parsed,
      simulation: { ...DEFAULT_INITIAL_STATE.simulation, ...parsed.simulation },
      appearance: {
        ...DEFAULT_INITIAL_STATE.appearance,
        ...parsed.appearance,
        homeLayout: parsed.appearance?.homeLayout || DEFAULT_INITIAL_STATE.appearance.homeLayout,
        appOrder: Array.isArray(parsed.appearance?.appOrder) && parsed.appearance.appOrder.length > 0
          ? parsed.appearance.appOrder
          : DEFAULT_INITIAL_STATE.appearance.appOrder,
        dashboardStats: Array.isArray(parsed.appearance?.dashboardStats) && parsed.appearance.dashboardStats.length === 3
          ? parsed.appearance.dashboardStats
          : DEFAULT_INITIAL_STATE.appearance.dashboardStats,
      },
      sound: { ...DEFAULT_INITIAL_STATE.sound, ...parsed.sound },
      group: { ...DEFAULT_INITIAL_STATE.group, ...parsed.group },
      notes: Array.isArray(parsed.notes) ? parsed.notes : DEFAULT_INITIAL_STATE.notes,
      noteTags: Array.isArray(parsed.noteTags) ? parsed.noteTags : DEFAULT_INITIAL_STATE.noteTags,
      weeklyPlans: parsed.weeklyPlans && typeof parsed.weeklyPlans === 'object' ? parsed.weeklyPlans : DEFAULT_INITIAL_STATE.weeklyPlans,
      polaroids: Array.isArray(parsed.polaroids) ? parsed.polaroids : DEFAULT_INITIAL_STATE.polaroids,
    };
  } catch {
    return DEFAULT_INITIAL_STATE;
  }
}

export function saveStoredState(state: AppFullState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode fallback
  }
}

// Full JSON Backup Export
export function exportFullBackupJson(state: AppFullState) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  downloadAnchor.setAttribute('download', `suyan_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Full JSON Backup Import
export function importFullBackupJson(file: File): Promise<AppFullState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.cards || !parsed.simulation) {
          reject(new Error('数据格式不完整'));
          return;
        }
        resolve({
          ...DEFAULT_INITIAL_STATE,
          ...parsed,
          simulation: { ...DEFAULT_INITIAL_STATE.simulation, ...parsed.simulation },
          appearance: {
            ...DEFAULT_INITIAL_STATE.appearance,
            ...parsed.appearance,
            homeLayout: parsed.appearance?.homeLayout || DEFAULT_INITIAL_STATE.appearance.homeLayout,
            appOrder: Array.isArray(parsed.appearance?.appOrder) && parsed.appearance.appOrder.length > 0
              ? parsed.appearance.appOrder
              : DEFAULT_INITIAL_STATE.appearance.appOrder,
            dashboardStats: Array.isArray(parsed.appearance?.dashboardStats) && parsed.appearance.dashboardStats.length === 3
              ? parsed.appearance.dashboardStats
              : DEFAULT_INITIAL_STATE.appearance.dashboardStats,
          },
          sound: { ...DEFAULT_INITIAL_STATE.sound, ...parsed.sound },
          group: { ...DEFAULT_INITIAL_STATE.group, ...parsed.group },
          notes: Array.isArray(parsed.notes) ? parsed.notes : DEFAULT_INITIAL_STATE.notes,
          noteTags: Array.isArray(parsed.noteTags) ? parsed.noteTags : DEFAULT_INITIAL_STATE.noteTags,
          weeklyPlans: parsed.weeklyPlans && typeof parsed.weeklyPlans === 'object' ? parsed.weeklyPlans : DEFAULT_INITIAL_STATE.weeklyPlans,
          polaroids: Array.isArray(parsed.polaroids) ? parsed.polaroids : DEFAULT_INITIAL_STATE.polaroids,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

// Standalone Cards TXT Export (with 【分组名称】 syntax)
export function exportCardsToTxt(cards: WordCard[], categories: Category[]): void {
  const catMap = new Map<string, string[]>();
  categories.forEach((cat) => catMap.set(cat.name, []));

  cards.forEach((card) => {
    const catName = card.category || '未分类';
    if (!catMap.has(catName)) {
      catMap.set(catName, []);
    }
    catMap.get(catName)!.push(card.text);
  });

  const lines: string[] = [];
  for (const [catName, texts] of catMap.entries()) {
    if (texts.length === 0) continue;
    lines.push(`【${catName}】`);
    texts.forEach((txt) => lines.push(txt));
    lines.push(''); // blank line between groups
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `suyan_wordcards_${Date.now()}.txt`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

// Parse TXT cards (supports 【分组名称】 headers and lines)
export function parseCardsFromTxt(
  text: string,
  existingCategories: Category[]
): { cards: WordCard[]; newCategories: Category[] } {
  const lines = text.split(/\r?\n/);
  let currentCategory = existingCategories[0]?.name || '默认';
  const newCards: WordCard[] = [];
  const knownCats = new Set(existingCategories.map((c) => c.name));
  const newCatObjects: Category[] = [...existingCategories];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for 【分组名称】 or [分组名称]
    const headerMatch = line.match(/^[【\[](.+?)[】\]]$/);
    if (headerMatch) {
      currentCategory = headerMatch[1].trim();
      if (!knownCats.has(currentCategory)) {
        knownCats.add(currentCategory);
        newCatObjects.push({
          id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: currentCategory,
          blocked: false,
          order: newCatObjects.length + 1,
        });
      }
      continue;
    }

    newCards.push({
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: currentCategory,
      text: line,
      blocked: false,
      createdAt: Date.now(),
    });
  }

  return { cards: newCards, newCategories: newCatObjects };
}

// Deduplicate cards by text within the same category or across all categories
export function deduplicateCards(cards: WordCard[]): { uniqueCards: WordCard[]; removedCount: number } {
  const seen = new Set<string>();
  const uniqueCards: WordCard[] = [];
  let removedCount = 0;

  for (const card of cards) {
    const key = `${card.category}:::${card.text.trim()}`;
    if (seen.has(key)) {
      removedCount++;
    } else {
      seen.add(key);
      uniqueCards.push(card);
    }
  }

  return { uniqueCards, removedCount };
}
