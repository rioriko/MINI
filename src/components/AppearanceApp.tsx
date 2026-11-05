import React from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Upload, Trash2, Check } from 'lucide-react';
import { AppearanceConfig } from '../types';

interface AppearanceAppProps {
  config: AppearanceConfig;
  onBack: () => void;
  onUpdateConfig: (config: AppearanceConfig) => void;
}

export const AppearanceApp: React.FC<AppearanceAppProps> = ({
  config,
  onBack,
  onUpdateConfig,
}) => {
  const update = (patch: Partial<AppearanceConfig>) => {
    onUpdateConfig({ ...config, ...patch });
  };

  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      update({ chatBackground: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const bubbleOptions: Array<{ id: AppearanceConfig['bubbleStyle']; name: string }> = [
    { id: 'minimal', name: '极简细角' },
    { id: 'rounded', name: '圆润柔和' },
    { id: 'bordered', name: '素雅细边' },
    { id: 'contrast', name: '高阶对比' },
  ];

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 select-none transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-stone-100/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          <span className="text-xs font-serif tracking-wider">桌面</span>
        </button>

        <span className="text-sm font-serif font-medium tracking-wide">排版与主题</span>

        <div className="w-10"></div>
      </header>

      {/* Main Settings Form */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Theme mode: System / Light / Dark */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <span className="text-xs font-serif font-medium block">色调主题</span>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'system', name: '跟随系统', icon: Monitor },
              { id: 'light', name: '素白日间', icon: Sun },
              { id: 'dark', name: '玄墨夜间', icon: Moon },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = config.themeMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => update({ themeMode: item.id as any })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                  <span className="text-xs font-serif">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Home Screen Layout Switch */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <span className="text-xs font-serif font-medium block">主屏幕布局形态</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'dashboard', name: '灵动个人主页', desc: '名号 · 数据栏 · 对话与相册微件' },
              { id: 'grid', name: '经典图标桌面', desc: '自由排序 · 固定位置 · 极简网格' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => update({ homeLayout: item.id as any })}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  (config.homeLayout || 'dashboard') === item.id
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                }`}
              >
                <span className="text-xs font-serif font-medium">{item.name}</span>
                <span className="text-[10px] opacity-75 mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display Switches: Avatar, Name, Timestamp, Read Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <span className="text-xs font-serif font-medium block border-b border-stone-100 dark:border-stone-800 pb-2">
            消息项显示
          </span>

          <div className="grid grid-cols-2 gap-4">
            {/* Show Avatar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif">显示头像</span>
              <button
                onClick={() => update({ showAvatar: !config.showAvatar })}
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                  config.showAvatar ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.showAvatar ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Name */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif">显示称谓</span>
              <button
                onClick={() => update({ showName: !config.showName })}
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                  config.showName ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.showName ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show Read Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif">已读状态</span>
              <button
                onClick={() => update({ showReadStatus: !config.showReadStatus })}
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                  config.showReadStatus ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.showReadStatus ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Default Timestamp (Prompt: 点击消息再出现时间戳，日常默认隐藏) */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif">常驻时间戳</span>
              <button
                onClick={() => update({ showTimestampDefault: !config.showTimestampDefault })}
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                  config.showTimestampDefault ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.showTimestampDefault ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Read status text customizer */}
          {config.showReadStatus && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4">
              <span className="text-xs font-serif text-stone-500">已读文字样式</span>
              <div className="flex items-center gap-1.5">
                {['已读', 'READ', '✓✓', '阅', '知'].map((style) => (
                  <button
                    key={style}
                    onClick={() => update({ readStatusText: style })}
                    className={`px-2 py-0.5 rounded text-[11px] font-serif transition-colors ${
                      config.readStatusText === style
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Font Size & Bubble Style */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          <div>
            <span className="text-xs font-serif font-medium block mb-2">字号大小</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', name: '小' },
                { id: 'md', name: '中（默认）' },
                { id: 'lg', name: '大' },
                { id: 'xl', name: '特大' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => update({ fontSize: size.id as any })}
                  className={`py-1.5 rounded-lg border text-xs font-serif transition-colors ${
                    config.fontSize === size.id
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs font-serif font-medium block mb-2">气泡形态</span>
            <div className="grid grid-cols-4 gap-2">
              {bubbleOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => update({ bubbleStyle: opt.id })}
                  className={`py-1.5 rounded-lg border text-xs font-serif transition-colors ${
                    config.bubbleStyle === opt.id
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Font / CSS & Chat Background */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          {/* Chat Background */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif font-medium">聊天背景</span>
              {config.chatBackground && (
                <button
                  onClick={() => update({ chatBackground: '' })}
                  className="text-[11px] font-serif text-red-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清除背景</span>
                </button>
              )}
            </div>

            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 cursor-pointer transition-colors text-xs font-serif text-stone-600 dark:text-stone-300">
              <Upload className="w-4 h-4" />
              <span>上传背景壁纸图片</span>
              <input type="file" accept="image/*" onChange={handleUploadBg} className="hidden" />
            </label>
          </div>

          {/* Custom Font URL */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="text-xs font-serif font-medium block mb-1">
              自定义字体 Web Font URL
            </label>
            <input
              type="text"
              value={config.customFontUrl}
              onChange={(e) => update({ customFontUrl: e.target.value })}
              placeholder="如 https://fonts.googleapis.com/...（留空即宋体）"
              className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
            />
          </div>

          {/* Custom CSS */}
          <div>
            <label className="text-xs font-serif font-medium block mb-1">
              自定义补充 CSS
            </label>
            <textarea
              value={config.customCss}
              onChange={(e) => update({ customCss: e.target.value })}
              placeholder="/* 自定义气泡、字体或其他样式规则 */"
              rows={3}
              className="w-full p-2 text-xs font-mono bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
