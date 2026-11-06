import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Layers,
  FileText,
  CalendarDays,
  Camera,
  Sliders,
  Users,
  Palette,
  Bell,
  Archive,
  Sun,
  Moon,
  Search,
  Heart,
  MessageCircle,
  LayoutGrid,
  User,
  ArrowUp,
  ArrowDown,
  Check,
  Edit2,
  X,
  Sparkles,
  Mic,
  Upload,
} from 'lucide-react';
import { ActiveApp, AppearanceConfig, AppFullState, GroupConfig } from '../types';
import { isAvatarImage, resizeImageFile } from '../utils/storage';

interface HomeScreenProps {
  state: AppFullState;
  onOpenApp: (app: ActiveApp) => void;
  onToggleTheme: () => void;
  onUpdateAppearance: (appearance: AppearanceConfig) => void;
  onUpdateGroup: (group: GroupConfig) => void;
  currentTheme: 'light' | 'dark';
}

const ALL_APPS: Array<{ id: ActiveApp; title: string; icon: any }> = [
  { id: 'chat', title: '对话', icon: MessageSquare },
  { id: 'cards', title: '字卡', icon: Layers },
  { id: 'notes', title: '便签', icon: FileText },
  { id: 'planner', title: '周规', icon: CalendarDays },
  { id: 'gallery', title: '相册', icon: Camera },
  { id: 'simulation', title: '拟真', icon: Sliders },
  { id: 'group', title: '通讯录', icon: Users },
  { id: 'appearance', title: '排版', icon: Palette },
  { id: 'sound', title: '声效', icon: Bell },
  { id: 'backup', title: '归档', icon: Archive },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  state,
  onOpenApp,
  onToggleTheme,
  onUpdateAppearance,
  onUpdateGroup,
  currentTheme,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Mode: 'dashboard' (mirroring user's screenshot) vs 'grid' (classic 10-app desktop)
  const isDashboardMode = state.appearance.homeLayout !== 'grid';

  // Desktop arrangement mode (reordering apps)
  const [isArranging, setIsArranging] = useState(false);

  // Quick edit profile modal (name, bio, quote, avatar)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(state.group.partnerName || '未定义');
  const [editAvatar, setEditAvatar] = useState(state.group.partnerAvatar || '');
  const [editBio, setEditBio] = useState(state.appearance.customBio || '见素抱朴 · 岁岁平安');
  const [editQuote, setEditQuote] = useState(
    state.appearance.customQuote || '言之所至，心之所安。在寂静处，与你对话。'
  );

  useEffect(() => {
    setEditName(state.group.partnerName || '未定义');
    setEditAvatar(state.group.partnerAvatar || '');
    setEditBio(state.appearance.customBio || '见素抱朴 · 岁岁平安');
    setEditQuote(state.appearance.customQuote || '言之所至，心之所安。在寂静处，与你对话。');
  }, [state.group.partnerName, state.group.partnerAvatar, state.appearance.customBio, state.appearance.customQuote]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 256, 0.85);
      setEditAvatar(dataUrl);
    } catch {
      // ignore
    }
  };

  // Search popover in dashboard mode
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Heart quote toggle
  const [quoteLiked, setQuoteLiked] = useState(false);

  // Custom 3-column stats (No jumping, custom text input!)
  const statsData = state.appearance.dashboardStats || [
    { value: '未定义', label: '未定义' },
    { value: '未定义', label: '未定义' },
    { value: '未定义', label: '未定义' },
  ];
  const [showEditStatsModal, setShowEditStatsModal] = useState(false);
  const [editStats, setEditStats] = useState<[
    { value: string; label: string },
    { value: string; label: string },
    { value: string; label: string }
  ]>(statsData);

  useEffect(() => {
    if (state.appearance.dashboardStats) {
      setEditStats(state.appearance.dashboardStats);
    }
  }, [state.appearance.dashboardStats]);

  const handleSaveStats = () => {
    onUpdateAppearance({
      ...state.appearance,
      dashboardStats: editStats,
    });
    setShowEditStatsModal(false);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);

      const months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const monthChinese = months[now.getMonth()];
      const dayChinese = now.getDate();
      const weekDay = days[now.getDay()];
      setDateStr(`${monthChinese}月${dayChinese}日 星期${weekDay}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  // Compute sorted apps list based on user's custom appOrder
  const currentAppOrder = state.appearance.appOrder || [
    'chat',
    'cards',
    'notes',
    'planner',
    'gallery',
    'simulation',
    'group',
    'appearance',
    'sound',
    'backup',
  ];

  const orderedApps = currentAppOrder
    .map((id) => ALL_APPS.find((a) => a.id === id))
    .filter(Boolean) as typeof ALL_APPS;

  // Move app up or down in order
  const moveApp = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedApps.length) return;

    const newOrder = [...currentAppOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    onUpdateAppearance({
      ...state.appearance,
      appOrder: newOrder,
    });
  };

  const handleToggleLayout = () => {
    onUpdateAppearance({
      ...state.appearance,
      homeLayout: isDashboardMode ? 'grid' : 'dashboard',
    });
    setIsArranging(false);
  };

  const handleSaveProfile = () => {
    onUpdateGroup({
      ...state.group,
      partnerName: editName.trim() || '未定义',
      partnerAvatar: editAvatar.trim() || editName.slice(0, 1) || '素',
    });
    onUpdateAppearance({
      ...state.appearance,
      customBio: editBio.trim() || '见素抱朴 · 岁岁平安',
      customQuote: editQuote.trim() || '言之所至，心之所安。在寂静处，与你对话。',
    });
    setShowEditProfileModal(false);
  };

  // Recent messages for dialogue preview
  const recentMessages = state.messages.slice(-2);
  const latestBotMsg = state.messages.filter((m) => m.sender === 'bot').slice(-1)[0];
  const latestUserMsg = state.messages.filter((m) => m.sender === 'user').slice(-1)[0];

  // Latest photo for widget
  const latestPhoto = state.polaroids[0];

  // Stats calculation
  const totalCards = state.cards.filter((c) => !c.blocked).length;
  const totalNotes = state.notes.length;
  const currentWeekPlan = Object.values(state.weeklyPlans)[0];
  const weekTasks = currentWeekPlan ? Object.values(currentWeekPlan.days).flat() : [];
  const weekDone = weekTasks.filter((t) => t.completed).length;
  const weekTotal = weekTasks.length;
  const weekRate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? {
        cards: state.cards.filter((c) =>
          c.text.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        notes: state.notes.filter(
          (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }
    : null;

  return (
    <div className="w-full h-full min-h-screen flex flex-col justify-between select-none bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-500 overflow-y-auto pb-6">
      {/* ============================================================== */}
      {/* MODE A: DASHBOARD VIEW (参考用户图示布置的个人主页 / 灵动看板) */}
      {/* ============================================================== */}
      {isDashboardMode ? (
        <div className="flex-1 flex flex-col w-full max-w-sm mx-auto px-4 pt-4 pb-20">
          {/* Top Bar: Time + Layout switcher + Dark mode */}
          <div className="flex items-center justify-between py-1 mb-2">
            <span className="text-xs font-mono font-medium tracking-wide tabular-nums text-stone-700 dark:text-stone-300">
              {timeStr}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLayout}
                title="切换至应用桌面视图"
                className="px-2 py-0.5 rounded-full border border-stone-300 dark:border-stone-800 text-[11px] font-serif text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>切至桌面</span>
              </button>

              <button
                onClick={onToggleTheme}
                aria-label="切换日夜模式"
                className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                {currentTheme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 stroke-[1.5]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Banner Container with Protruding Avatar */}
          <div className="relative mb-3">
            {/* Gradient Top Banner (matching screenshot) */}
            <div className="w-full h-28 sm:h-32 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950 shadow-inner overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            {/* Centered Circular Avatar */}
            <div className="relative -mt-12 flex justify-center">
              <div
                onClick={() => setShowEditProfileModal(true)}
                className="w-20 h-20 rounded-full border-4 border-stone-100 dark:border-stone-950 bg-stone-950 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden relative group"
                title="轻触修改头像、名号与介绍"
              >
                {isAvatarImage(state.group.partnerAvatar) ? (
                  <img
                    src={state.group.partnerAvatar}
                    alt={state.group.partnerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-serif font-medium">
                    {state.group.partnerAvatar.trim() ||
                      state.group.partnerName.slice(0, 1) ||
                      '素'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-serif">
                  更换头像
                </div>
              </div>
            </div>

            {/* Persona Name & Bio */}
            <div
              onClick={() => setShowEditProfileModal(true)}
              className="text-center mt-2 space-y-1 cursor-pointer group"
              title="轻触编辑名号与署名"
            >
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-base font-serif font-medium tracking-wider text-stone-900 dark:text-stone-100">
                  {state.group.partnerName || '未定义'}
                </h2>
                <Edit2 className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-serif text-stone-400 dark:text-stone-500 tracking-wide">
                {state.appearance.customBio || '见素抱朴 · 岁岁平安'}
              </p>
            </div>
          </div>

          {/* 3-Column Custom Text Strip (No navigation jumping, custom user text with click-to-edit!) */}
          <div
            onClick={() => setShowEditStatsModal(true)}
            className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 py-3 mb-4 bg-white/70 dark:bg-stone-900/70 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xs cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-colors group"
            title="轻触修改三栏自定义文字"
          >
            {statsData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center px-1">
                <span className="text-sm font-serif font-medium text-stone-800 dark:text-stone-200 tracking-wide text-center truncate max-w-full">
                  {item.value || '未定义'}
                </span>
                <span className="text-[10px] font-serif text-stone-400 dark:text-stone-500 mt-0.5 text-center truncate max-w-full">
                  {item.label || '未定义'}
                </span>
              </div>
            ))}
          </div>

          {/* Search Capsule Bar (matching screenshot: 🔍 未定义) */}
          <div
            onClick={() => setShowSearchModal(true)}
            className="w-full h-10 px-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center gap-2 mb-4 cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs font-serif text-stone-400">
              检索字卡、奏帖与周规待办...
            </span>
          </div>

          {/* Middle Split Area (matching screenshot: Left dialogue bubbles + Right large squircle card) */}
          <div className="grid grid-cols-2 gap-3 mb-4 items-stretch">
            {/* Left Side: Dialogue Stream Snippet */}
            <div
              onClick={() => onOpenApp('chat')}
              className="p-3 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <div className="space-y-2.5">
                {/* Bot message bubble snippet */}
                <div className="flex items-start gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center text-[10px] font-serif shrink-0 overflow-hidden">
                    {isAvatarImage(state.group.partnerAvatar) ? (
                      <img src={state.group.partnerAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      state.group.partnerAvatar.trim().slice(0, 1) || '彼'
                    )}
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] font-serif text-stone-800 dark:text-stone-200 line-clamp-2">
                    {latestBotMsg?.text || '言止于意，心会于微。'}
                  </div>
                </div>

                {/* User message snippet */}
                <div className="flex items-start justify-end gap-1.5">
                  <div className="px-2.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-[11px] font-serif text-stone-100 dark:text-stone-900 line-clamp-2 text-right">
                    {latestUserMsg?.text || '随时轻触对谈'}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center text-[10px] font-serif shrink-0">
                    我
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] font-serif text-stone-400">
                <span>对话通道</span>
                <span className="underline">进入 →</span>
              </div>
            </div>

            {/* Right Side: Large Squircle Card (matching screenshot) */}
            <div
              onClick={() => onOpenApp('gallery')}
              className="relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 shadow-md cursor-pointer hover:scale-[1.02] transition-transform aspect-square flex flex-col justify-end p-3"
            >
              {latestPhoto ? (
                <>
                  <img
                    src={latestPhoto.imageUrl}
                    alt={latestPhoto.caption}
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 text-white space-y-0.5">
                    <p className="text-xs font-serif font-medium line-clamp-1">
                      {latestPhoto.caption}
                    </p>
                    <p className="text-[9px] font-serif text-stone-300">
                      {latestPhoto.dateStr}
                    </p>
                  </div>
                </>
              ) : (
                <div className="relative z-10 text-white space-y-1">
                  <p className="text-xs font-serif font-medium">拍立得挂饰</p>
                  <p className="text-[10px] font-serif text-stone-400">贴附专属手帐</p>
                </div>
              )}
            </div>
          </div>

          {/* Centered Quotation Block (matching screenshot: “ 未定义 ”) */}
          <div className="my-2 p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 shadow-2xs text-center space-y-2">
            <p className="text-xs font-serif leading-relaxed text-stone-700 dark:text-stone-300 px-2">
              “ {state.appearance.customQuote || '言之所至，心之所安。在寂静处，与你对话。'} ”
            </p>

            <div className="flex items-center justify-center gap-4 pt-1 text-stone-400 text-xs">
              <button
                onClick={() => setQuoteLiked(!quoteLiked)}
                className={`flex items-center gap-1 transition-colors ${
                  quoteLiked ? 'text-red-500' : 'hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${quoteLiked ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-serif">{quoteLiked ? '已心仪' : '心仪'}</span>
              </button>

              <button
                onClick={() => setShowEditProfileModal(true)}
                className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-serif">题句</span>
              </button>
            </div>
          </div>

          {/* Quick Speak Trigger Capsule (matching screenshot bottom pill) */}
          <div
            onClick={() => onOpenApp('chat')}
            className="w-full h-11 px-3.5 rounded-2xl bg-stone-200/70 dark:bg-stone-900 border border-stone-300/70 dark:border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-300/60 dark:hover:bg-stone-800/80 transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center text-[10px] font-serif overflow-hidden">
                {isAvatarImage(state.group.partnerAvatar) ? (
                  <img src={state.group.partnerAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  state.group.partnerAvatar.trim().slice(0, 1) || '素'
                )}
              </div>
              <span className="text-xs font-serif text-stone-600 dark:text-stone-300">
                轻触即发 · 触发对谈
              </span>
            </div>
            <Mic className="w-4 h-4 text-stone-500" />
          </div>

          {/* Bottom Floating Pill Dock Bar (matching screenshot dock: [对谈, 字卡, 周规, 归档]) */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xs h-14 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-lg flex items-center justify-around px-2 z-20">
            {[
              { id: 'chat' as ActiveApp, icon: MessageSquare, label: '对话' },
              { id: 'cards' as ActiveApp, icon: Layers, label: '字卡' },
              { id: 'planner' as ActiveApp, icon: CalendarDays, label: '周规' },
              { id: 'backup' as ActiveApp, icon: Archive, label: '归档' },
            ].map((dockItem) => {
              const Icon = dockItem.icon;
              return (
                <button
                  key={dockItem.id}
                  onClick={() => onOpenApp(dockItem.id)}
                  className="flex flex-col items-center justify-center p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-50 transition-colors"
                >
                  <Icon className="w-4 h-4 stroke-[1.6]" />
                  <span className="text-[10px] font-serif mt-0.5">{dockItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* MODE B: CLASSIC APP GRID DESKTOP (带自定义移动与固定特定位置)   */
        /* ============================================================== */
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8">
          {/* Top Header Widget */}
          <div className="pt-8 sm:pt-10 flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-sm mb-6 px-1">
              <span className="text-xs tracking-[0.3em] font-serif text-stone-500 dark:text-stone-400">
                {state.group.groupMode ? '群聊模式' : state.group.partnerName}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleLayout}
                  title="切换至个人看板视图"
                  className="px-2 py-0.5 rounded-full border border-stone-300 dark:border-stone-800 text-[11px] font-serif text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  <span>切至看板</span>
                </button>

                <button
                  onClick={() => setIsArranging(!isArranging)}
                  className={`px-2 py-0.5 rounded-full border text-[11px] font-serif transition-colors ${
                    isArranging
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-transparent'
                      : 'border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {isArranging ? '锁定布局' : '整理位置'}
                </button>

                <button
                  onClick={onToggleTheme}
                  aria-label="切换日夜模式"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                >
                  {currentTheme === 'dark' ? (
                    <Sun className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <Moon className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
            </div>

            {/* Large Aesthetic Clock */}
            <div className="text-5xl sm:text-6xl font-serif font-light tracking-tight mb-2 tabular-nums">
              {timeStr || '12:00'}
            </div>
            <div className="text-xs sm:text-sm font-serif tracking-[0.25em] text-stone-500 dark:text-stone-400">
              {dateStr || '素履以往 · 岁岁平安'}
            </div>
          </div>

          {/* Desktop Apps Grid (Sorted by user's custom fixed positioning!) */}
          <div className="my-auto py-6 w-full max-w-sm mx-auto">
            <div className="grid grid-cols-4 gap-y-6 gap-x-3 justify-items-center">
              {orderedApps.map((app, index) => {
                const Icon = app.icon;

                return (
                  <div key={app.id} className="relative flex flex-col items-center group">
                    <button
                      onClick={() => !isArranging && onOpenApp(app.id)}
                      className="flex flex-col items-center focus:outline-none"
                    >
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-center justify-center transition-transform duration-200 active:scale-95 group-hover:border-stone-400 dark:group-hover:border-stone-600">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.4] text-stone-800 dark:text-stone-200 transition-colors" />
                      </div>
                      <span className="mt-2 text-xs font-serif tracking-wider text-stone-700 dark:text-stone-300 group-hover:text-stone-950 dark:group-hover:text-stone-50 transition-colors">
                        {app.title}
                      </span>
                    </button>

                    {/* Arrange Mode Reordering Buttons (Custom movement) */}
                    {isArranging && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900 text-stone-100 rounded-full px-1.5 py-0.5 shadow-md text-[9px] font-mono z-10 animate-in zoom-in-75">
                        <button
                          onClick={() => moveApp(index, 'up')}
                          disabled={index === 0}
                          className="disabled:opacity-30 hover:text-stone-300"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <span>{index + 1}</span>
                        <button
                          onClick={() => moveApp(index, 'down')}
                          disabled={index === orderedApps.length - 1}
                          className="disabled:opacity-30 hover:text-stone-300"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Minimalist Footer */}
          <div className="pb-4 text-center">
            <div className="text-[11px] font-serif tracking-[0.25em] text-stone-400 dark:text-stone-600">
              素言 · 桌面系统
            </div>
          </div>
        </div>
      )}

      {/* Profile & Motto Edit Modal */}
      {showEditProfileModal && (
        <div
          onClick={() => setShowEditProfileModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <span className="text-sm font-serif font-medium">定制看板头像与署名</span>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar Upload and Preview */}
            <div className="flex flex-col items-center gap-2 py-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-3 border border-stone-200/80 dark:border-stone-700/60">
              <div className="relative w-16 h-16 rounded-full border-2 border-stone-200 dark:border-stone-700 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center overflow-hidden shadow-xs">
                {isAvatarImage(editAvatar) ? (
                  <img src={editAvatar} alt="头像预览" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-serif font-medium">
                    {editAvatar.trim() || editName.slice(0, 1) || '素'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 text-[11px] font-serif flex items-center gap-1.5 transition-opacity shadow-2xs">
                  <Upload className="w-3 h-3" />
                  <span>上传头像图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
                {isAvatarImage(editAvatar) ? (
                  <button
                    type="button"
                    onClick={() => setEditAvatar('')}
                    className="px-2 py-1 text-[11px] font-serif text-stone-400 hover:text-red-500 transition-colors"
                  >
                    清除图片
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-serif text-stone-400">单字:</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder={editName.slice(0, 1) || '素'}
                      className="w-8 h-6 text-center text-xs font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                名号称谓
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="未定义"
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                个人署名 / 个性介绍
              </label>
              <input
                type="text"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="未定义"
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                看板随心题句
              </label>
              <textarea
                value={editQuote}
                onChange={(e) => setEditQuote(e.target.value)}
                rows={2}
                placeholder="未定义"
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                保存设定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Popover Modal */}
      {showSearchModal && (
        <div
          onClick={() => setShowSearchModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-12"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-4 space-y-3 shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索字卡、奏帖与周规..."
                className="w-full h-9 pl-9 pr-8 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {searchResults ? (
                <>
                  {/* Cards Results */}
                  {searchResults.cards.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-serif text-stone-400">
                        匹配字卡 ({searchResults.cards.length})
                      </span>
                      {searchResults.cards.slice(0, 4).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setShowSearchModal(false);
                            onOpenApp('cards');
                          }}
                          className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs font-serif hover:border-stone-400 cursor-pointer"
                        >
                          {c.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes Results */}
                  {searchResults.notes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-serif text-stone-400">
                        匹配奏帖 ({searchResults.notes.length})
                      </span>
                      {searchResults.notes.slice(0, 3).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowSearchModal(false);
                            onOpenApp('notes');
                          }}
                          className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs font-serif hover:border-stone-400 cursor-pointer"
                        >
                          <span className="font-medium block">{n.title}</span>
                          <span className="text-[10px] text-stone-400 line-clamp-1">
                            {n.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.cards.length === 0 && searchResults.notes.length === 0 && (
                    <div className="py-8 text-center text-xs font-serif text-stone-400">
                      未检索到相关内容
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-xs font-serif text-stone-400">
                  输入关键字开始全局检索
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Custom Text Edit Modal */}
      {showEditStatsModal && (
        <div
          onClick={() => setShowEditStatsModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <div>
                <span className="text-sm font-serif font-medium block">定制三栏展示文案</span>
                <span className="text-[10px] font-serif text-stone-400">
                  纯文案展示（无跳转），可自由输入任意文字或数字
                </span>
              </div>
              <button
                onClick={() => setShowEditStatsModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2"
                >
                  <span className="text-[11px] font-serif font-medium text-stone-700 dark:text-stone-300 block">
                    第 {idx === 0 ? '一' : idx === 1 ? '二' : '三'} 栏
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-serif text-stone-400 block mb-0.5">
                        上行文案（大字）
                      </label>
                      <input
                        type="text"
                        value={editStats[idx]?.value || ''}
                        onChange={(e) => {
                          const updated = [...editStats] as typeof editStats;
                          updated[idx] = { ...updated[idx], value: e.target.value };
                          setEditStats(updated);
                        }}
                        placeholder="未定义"
                        className="w-full h-8 px-2.5 text-xs font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-serif text-stone-400 block mb-0.5">
                        下行文案（小字）
                      </label>
                      <input
                        type="text"
                        value={editStats[idx]?.label || ''}
                        onChange={(e) => {
                          const updated = [...editStats] as typeof editStats;
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setEditStats(updated);
                        }}
                        placeholder="未定义"
                        className="w-full h-8 px-2.5 text-xs font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  setEditStats([
                    { value: '未定义', label: '未定义' },
                    { value: '未定义', label: '未定义' },
                    { value: '未定义', label: '未定义' },
                  ]);
                }}
                className="text-[11px] font-serif text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline"
              >
                重置为“未定义”
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditStatsModal(false)}
                  className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveStats}
                  className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
                >
                  保存文案
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
