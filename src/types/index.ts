export interface WordCard {
  id: string;
  text: string;
  category: string;
  blocked: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  blocked: boolean;
  order: number;
}

export interface QuotedMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  senderName?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  senderName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  read: boolean;
  quotedMessage?: QuotedMessage;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string; // SVG or color/initial
  active: boolean;
  weight: number;
}

export interface SimulationConfig {
  delayMin: number; // in seconds
  delayMax: number; // in seconds
  proactiveEnabled: boolean;
  proactiveIntervalMin: number; // in minutes
  proactiveIntervalMax: number; // in minutes
  readWithoutReplyEnabled: boolean;
  readWithoutReplyRate: number; // percentage 0 - 100
  quoteReplyEnabled: boolean;
  quoteReplyRate: number; // percentage 0 - 100
  concatSentenceEnabled: boolean;
  concatSeparators: string[];
  replyCountMin: number;
  replyCountMax: number;
  typingIndicatorText: string;
}

export interface AppearanceConfig {
  themeMode: 'system' | 'light' | 'dark';
  showAvatar: boolean;
  showName: boolean;
  showTimestampDefault: boolean;
  showReadStatus: boolean;
  readStatusText: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: string;
  customFontUrl: string;
  customCss: string;
  bubbleStyle: 'minimal' | 'rounded' | 'bordered' | 'contrast';
  chatBackground: string;
  homeLayout: 'grid' | 'dashboard';
  customBio: string;
  customQuote: string;
  appOrder: ActiveApp[];
  dashboardStats: [
    { value: string; label: string },
    { value: string; label: string },
    { value: string; label: string }
  ];
}

export interface SoundConfig {
  soundEnabled: boolean;
  randomSoundEnabled: boolean;
  presetSound: 'click' | 'wood' | 'chime' | 'soft' | 'bubble';
  customSoundUrl: string;
  volume: number;
  notificationEnabled: boolean;
}

export interface GroupConfig {
  groupMode: boolean;
  partnerName: string;
  partnerAvatar: string;
  groupMembers: GroupMember[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  pinned: boolean;
  solarTerm: string;
  timestamp: number;
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export type DayOfWeekKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WeekGoal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface WeekPlanData {
  weekKey: string; // e.g. "2026-W45"
  days: Record<DayOfWeekKey, DailyTask[]>;
  goals: WeekGoal[];
  summaryNote?: string;
}

export interface PolaroidPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  dateStr: string;
  tiltDeg: number;
  timestamp: number;
}

export interface AppFullState {
  version: number;
  cards: WordCard[];
  categories: Category[];
  messages: Message[];
  simulation: SimulationConfig;
  appearance: AppearanceConfig;
  sound: SoundConfig;
  group: GroupConfig;
  notes: Note[];
  noteTags: string[];
  weeklyPlans: Record<string, WeekPlanData>;
  polaroids: PolaroidPhoto[];
  introSeen: boolean;
}

export type ActiveApp =
  | 'home'
  | 'chat'
  | 'cards'
  | 'notes'
  | 'planner'
  | 'gallery'
  | 'simulation'
  | 'group'
  | 'appearance'
  | 'sound'
  | 'backup';
