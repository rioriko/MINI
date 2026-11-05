import React from 'react';
import { ArrowLeft, Bell, Volume2, VolumeX, Play, Shuffle } from 'lucide-react';
import { SoundConfig } from '../types';
import {
  soundEngine,
  playMessageSound,
  requestNotificationPermission,
} from '../utils/sound';

interface SoundAppProps {
  config: SoundConfig;
  onBack: () => void;
  onUpdateConfig: (config: SoundConfig) => void;
}

export const SoundApp: React.FC<SoundAppProps> = ({
  config,
  onBack,
  onUpdateConfig,
}) => {
  const update = (patch: Partial<SoundConfig>) => {
    onUpdateConfig({ ...config, ...patch });
  };

  const handleTestSound = (preset: SoundConfig['presetSound']) => {
    soundEngine.playPreset(preset, config.volume);
  };

  const handleToggleNotification = async () => {
    if (!config.notificationEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        update({ notificationEnabled: true });
      } else {
        alert('浏览器通知权限未开启或被拒绝，请在浏览器站点设置中允许通知。');
      }
    } else {
      update({ notificationEnabled: false });
    }
  };

  const presets: Array<{ id: SoundConfig['presetSound']; name: string; desc: string }> = [
    { id: 'click', name: '极简微键', desc: '轻脆机械触感' },
    { id: 'wood', name: '木柝微鸣', desc: '温润中音木敲' },
    { id: 'chime', name: '素音磬韵', desc: '安宁和弦轻响' },
    { id: 'soft', name: '绒墨轻落', desc: '低沉柔和微降' },
    { id: 'bubble', name: '水滴浮泡', desc: '清透气泡回音' },
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

        <span className="text-sm font-serif font-medium tracking-wide">声效与通知</span>

        <div className="w-10"></div>
      </header>

      {/* Main Form */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Master Sound Switch */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {config.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-stone-800 dark:text-stone-200 stroke-[1.5]" />
              ) : (
                <VolumeX className="w-5 h-5 text-stone-400 stroke-[1.5]" />
              )}
              <span className="text-xs font-serif font-medium">消息收发音效</span>
            </div>

            <button
              onClick={() => update({ soundEnabled: !config.soundEnabled })}
              className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                config.soundEnabled ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                  config.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {config.soundEnabled && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-serif text-stone-500">
                <span>音量大小</span>
                <span className="tabular-nums">{Math.round(config.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={config.volume}
                onChange={(e) => update({ volume: parseFloat(e.target.value) })}
                className="w-full accent-stone-800 dark:accent-stone-200 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Random Playlist & Presets */}
        {config.soundEnabled && (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
            {/* Random sound playlist toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-stone-600 dark:text-stone-400 stroke-[1.5]" />
                <span className="text-xs font-serif font-medium">随机轮播音效列表</span>
              </div>

              <button
                onClick={() => update({ randomSoundEnabled: !config.randomSoundEnabled })}
                className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  config.randomSoundEnabled
                    ? 'bg-stone-900 dark:bg-stone-100'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                    config.randomSoundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <span className="text-[11px] font-serif text-stone-400 block">
                {config.randomSoundEnabled ? '随机池内包含以下音效：' : '选择固定音效：'}
              </span>

              {presets.map((preset) => {
                const isSelected = config.presetSound === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      if (!config.randomSoundEnabled) {
                        update({ presetSound: preset.id });
                      }
                      handleTestSound(preset.id);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      !config.randomSoundEnabled && isSelected
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-serif font-medium block">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-serif opacity-70">
                        {preset.desc}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestSound(preset.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
                      title="试听音效"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Custom Sound URL */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                自定义外部音频 URL（留空则使用内置音效）
              </label>
              <input
                type="text"
                value={config.customSoundUrl}
                onChange={(e) => update({ customSoundUrl: e.target.value })}
                placeholder="https://.../bell.mp3"
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* System Web Notifications */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-stone-800 dark:text-stone-200 stroke-[1.5]" />
            <div>
              <span className="text-xs font-serif font-medium block">系统通知提醒</span>
              <span className="text-[10px] font-serif text-stone-400">
                对方发信时触发桌面系统通知
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleNotification}
            className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
              config.notificationEnabled
                ? 'bg-stone-900 dark:bg-stone-100'
                : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                config.notificationEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
