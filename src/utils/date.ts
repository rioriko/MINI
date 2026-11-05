import { DayOfWeekKey } from '../types';

export const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

export function getSolarTerm(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Approximate solar term dates
  const termDates: Record<number, [number, string, number, string]> = {
    1: [5, '小寒', 20, '大寒'],
    2: [4, '立春', 19, '雨水'],
    3: [6, '惊蛰', 21, '春分'],
    4: [5, '清明', 20, '谷雨'],
    5: [6, '立夏', 21, '小满'],
    6: [6, '芒种', 21, '夏至'],
    7: [7, '小暑', 23, '大暑'],
    8: [8, '立秋', 23, '处暑'],
    9: [8, '白露', 23, '秋分'],
    10: [8, '寒露', 23, '霜降'],
    11: [7, '立冬', 22, '小雪'],
    12: [7, '大雪', 22, '冬至'],
  };

  const [d1, t1, d2, t2] = termDates[month] || [7, '立冬', 22, '小雪'];
  if (day < d1) {
    const prevMonth = month === 1 ? 12 : month - 1;
    return termDates[prevMonth][3];
  } else if (day < d2) {
    return t1;
  } else {
    return t2;
  }
}

export function formatNoteDate(timestamp: number): { solar: string; dateStr: string; timeStr: string } {
  const date = new Date(timestamp);
  const solar = getSolarTerm(date);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return {
    solar,
    dateStr: `${m}月${d}日`,
    timeStr: `${hh}:${mm}`,
  };
}

// Get ISO Week string like "2026-W45"
export function getISOWeekKey(d: Date = new Date()): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Get dates for Mon ~ Sun of a given weekKey
export function getWeekDates(weekKey: string): { key: DayOfWeekKey; name: string; date: Date; dateStr: string }[] {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // Jan 4th is always in week 1
  const simple = new Date(year, 0, 4);
  const dayOfWeek = (simple.getDay() + 6) % 7;
  const monday = new Date(simple.valueOf());
  monday.setDate(simple.getDate() - dayOfWeek + (week - 1) * 7);

  const daysConfig: { key: DayOfWeekKey; name: string }[] = [
    { key: 'mon', name: '月曜日' },
    { key: 'tue', name: '火曜日' },
    { key: 'wed', name: '水曜日' },
    { key: 'thu', name: '木曜日' },
    { key: 'fri', name: '金曜日' },
    { key: 'sat', name: '土曜日' },
    { key: 'sun', name: '日曜日' },
  ];

  return daysConfig.map((item, idx) => {
    const cur = new Date(monday.valueOf());
    cur.setDate(monday.getDate() + idx);
    const m = cur.getMonth() + 1;
    const d = cur.getDate();
    return {
      key: item.key,
      name: item.name,
      date: cur,
      dateStr: `${m}/${d}`,
    };
  });
}

// Shift week by delta (-1 or +1)
export function shiftWeekKey(weekKey: string, delta: number): string {
  const dates = getWeekDates(weekKey);
  const midDate = new Date(dates[3].date.valueOf());
  midDate.setDate(midDate.getDate() + delta * 7);
  return getISOWeekKey(midDate);
}

// Get user-friendly week range text (e.g. "2026年 第45周 · 11月2日 - 11月8日")
export function getWeekRangeDisplay(weekKey: string): string {
  const dates = getWeekDates(weekKey);
  const [yearStr, weekStr] = weekKey.split('-W');
  const start = dates[0].date;
  const end = dates[6].date;
  return `${yearStr}年 第${parseInt(weekStr, 10)}周 · ${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
}
