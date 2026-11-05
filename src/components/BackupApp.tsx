import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Upload,
  RotateCcw,
  Film,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { AppFullState } from '../types';
import {
  exportFullBackupJson,
  importFullBackupJson,
  exportCardsToTxt,
  DEFAULT_INITIAL_STATE,
} from '../utils/storage';

interface BackupAppProps {
  state: AppFullState;
  onBack: () => void;
  onRestoreState: (newState: AppFullState) => void;
  onReplayIntro: () => void;
}

export const BackupApp: React.FC<BackupAppProps> = ({
  state,
  onBack,
  onRestoreState,
  onReplayIntro,
}) => {
  const handleExportJson = () => {
    exportFullBackupJson(state);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importFullBackupJson(file)
      .then((importedState) => {
        onRestoreState(importedState);
        alert('系统全量数据已成功恢复！');
      })
      .catch((err) => {
        alert(`导入失败：${err.message || '数据解析错误'}`);
      });
    e.target.value = '';
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetAll = () => {
    setShowResetConfirm(true);
  };

  const executeResetAll = () => {
    onRestoreState({
      ...DEFAULT_INITIAL_STATE,
      introSeen: true,
    });
    setShowResetConfirm(false);
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

        <span className="text-sm font-serif font-medium tracking-wide">归档与系统</span>

        <div className="w-10"></div>
      </header>

      {/* Main Form */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Full Backup Export / Import */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-stone-800 dark:text-stone-200" />
              <span className="text-xs font-serif font-medium">全量数据归档</span>
            </div>
            <span className="text-[10px] font-serif text-stone-400">
              包含所有模块与独立数据
            </span>
          </div>

          <div className="text-[11px] font-serif text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
            涵盖范围：字卡库 ({state.cards.length}) · 对话记录 ({state.messages.length}) · 奏帖便签 ({state.notes.length}) · 周规日程 ({Object.keys(state.weeklyPlans).length}周) · 拍立得手帐 ({state.polaroids.length}) · 拟真与排版设定
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJson}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-stone-50 dark:bg-stone-800/60 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5 stroke-[1.5] text-stone-800 dark:text-stone-200" />
              <span className="text-xs font-serif font-medium">导出完整配置 (JSON)</span>
            </button>

            <label className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-stone-50 dark:bg-stone-800/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 stroke-[1.5] text-stone-800 dark:text-stone-200" />
              <span className="text-xs font-serif font-medium">恢复完整配置 (JSON)</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Word Cards Quick TXT Export */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
            <FileText className="w-4 h-4 text-stone-800 dark:text-stone-200" />
            <span className="text-xs font-serif font-medium">独立字卡导出</span>
          </div>

          <button
            onClick={() => exportCardsToTxt(state.cards, state.categories)}
            className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-xs font-serif flex items-center justify-center gap-2 hover:border-stone-400 transition-colors"
          >
            <Download className="w-4 h-4 stroke-[1.5]" />
            <span>导出字卡库为文本文件 (TXT)</span>
          </button>
        </div>

        {/* Replay Opening Animation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-stone-800 dark:text-stone-200 stroke-[1.5]" />
            <div>
              <span className="text-xs font-serif font-medium block">开场白动画</span>
              <span className="text-[10px] font-serif text-stone-400">重新播放入境开屏动画</span>
            </div>
          </div>

          <button
            onClick={onReplayIntro}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-serif hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            重放动画
          </button>
        </div>

        {/* Factory Reset */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/40 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-serif font-medium">数据重置</span>
          </div>

          <p className="text-[11px] font-serif text-stone-500 leading-relaxed">
            重置将清除所有历史对话、字卡库变更并还原默认设定。
          </p>

          <button
            onClick={handleResetAll}
            className="w-full py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-serif hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复出厂初始设定</span>
          </button>
        </div>
      </div>

      {/* Factory Reset Modal */}
      {showResetConfirm && (
        <div
          onClick={() => setShowResetConfirm(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-red-300 dark:border-red-900/50 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="space-y-1.5 text-center">
              <span className="text-sm font-serif font-medium text-red-600 dark:text-red-400 block">
                重置所有数据
              </span>
              <p className="text-xs font-serif text-stone-500 dark:text-stone-400 leading-relaxed">
                确认清除所有自定义字卡、奏帖、日程与照片，恢复至初始默认值？
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeResetAll}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
