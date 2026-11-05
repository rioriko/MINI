import React from 'react';
import { ArrowLeft, Sliders, Check } from 'lucide-react';
import { SimulationConfig } from '../types';

interface SimulationAppProps {
  config: SimulationConfig;
  onBack: () => void;
  onUpdateConfig: (config: SimulationConfig) => void;
}

export const SimulationApp: React.FC<SimulationAppProps> = ({
  config,
  onBack,
  onUpdateConfig,
}) => {
  const update = (patch: Partial<SimulationConfig>) => {
    onUpdateConfig({ ...config, ...patch });
  };

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

        <span className="text-sm font-serif font-medium tracking-wide">拟真逻辑</span>

        <div className="w-10"></div>
      </header>

      {/* Main Settings Form */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Reply Delay & Indicator */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <span className="text-xs font-serif font-medium">拟真回复延迟</span>
            <span className="text-xs font-serif text-stone-500 tabular-nums">
              {config.delayMin}s ~ {config.delayMax}s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">最短秒数</label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={config.delayMin}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  update({ delayMin: val, delayMax: Math.max(val, config.delayMax) });
                }}
                className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">最长秒数</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={config.delayMax}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  update({ delayMax: Math.max(val, config.delayMin) });
                }}
                className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-serif text-stone-500 block mb-1">
              正在输入提示语
            </label>
            <input
              type="text"
              value={config.typingIndicatorText}
              onChange={(e) => update({ typingIndicatorText: e.target.value })}
              placeholder="对方正在输入..."
              className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Proactive Messaging (主动发送) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium">主动偶发来信</span>
            <button
              onClick={() => update({ proactiveEnabled: !config.proactiveEnabled })}
              className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                config.proactiveEnabled ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                  config.proactiveEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.proactiveEnabled && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-serif text-stone-500">
                <span>触发间隔（分钟）</span>
                <span className="tabular-nums">
                  {config.proactiveIntervalMin}m ~ {config.proactiveIntervalMax}m
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={config.proactiveIntervalMin}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      update({
                        proactiveIntervalMin: val,
                        proactiveIntervalMax: Math.max(val, config.proactiveIntervalMax),
                      });
                    }}
                    className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
                  />
                </div>
                <div>
                  <input
                    type="range"
                    min="2"
                    max="120"
                    step="1"
                    value={config.proactiveIntervalMax}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      update({
                        proactiveIntervalMax: Math.max(val, config.proactiveIntervalMin),
                      });
                    }}
                    className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Read Without Reply & Quote Reply */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          {/* 已读不回 */}
          <div className="space-y-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-medium">已读不回模式</span>
                {config.readWithoutReplyEnabled && (
                  <span className="text-[11px] font-serif text-stone-500">
                    {config.readWithoutReplyRate}% 概率
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  update({ readWithoutReplyEnabled: !config.readWithoutReplyEnabled })
                }
                className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  config.readWithoutReplyEnabled
                    ? 'bg-stone-900 dark:bg-stone-100'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.readWithoutReplyEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.readWithoutReplyEnabled && (
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={config.readWithoutReplyRate}
                onChange={(e) => update({ readWithoutReplyRate: parseInt(e.target.value, 10) })}
                className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
              />
            )}
          </div>

          {/* 引用回复 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-medium">引用近十条回复</span>
                {config.quoteReplyEnabled && (
                  <span className="text-[11px] font-serif text-stone-500">
                    {config.quoteReplyRate}% 概率
                  </span>
                )}
              </div>
              <button
                onClick={() => update({ quoteReplyEnabled: !config.quoteReplyEnabled })}
                className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  config.quoteReplyEnabled
                    ? 'bg-stone-900 dark:bg-stone-100'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.quoteReplyEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.quoteReplyEnabled && (
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={config.quoteReplyRate}
                onChange={(e) => update({ quoteReplyRate: parseInt(e.target.value, 10) })}
                className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Sentence Concatenation (连句功能) & Reply Counts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-medium">多句连缀成气泡</span>
            <button
              onClick={() => update({ concatSentenceEnabled: !config.concatSentenceEnabled })}
              className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                config.concatSentenceEnabled
                  ? 'bg-stone-900 dark:bg-stone-100'
                  : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                  config.concatSentenceEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.concatSentenceEnabled && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <label className="text-[11px] font-serif text-stone-500 block">
                连句随机分隔符（逗号隔开）
              </label>
              <input
                type="text"
                value={config.concatSeparators.join(', ')}
                onChange={(e) => {
                  const seps = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  update({ concatSeparators: seps });
                }}
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-serif">
            <span>回复条数区间</span>
            <span className="tabular-nums text-stone-500">
              {config.replyCountMin} ~ {config.replyCountMax} 条
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
