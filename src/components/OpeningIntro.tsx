import React, { useState, useEffect } from 'react';

interface OpeningIntroProps {
  onComplete: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 1200);
    const t3 = setTimeout(() => setStage(3), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between px-8 py-16 cursor-pointer select-none bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-1000"
    >
      {/* Top subtle emblem */}
      <div
        className={`transition-all duration-1000 ${
          stage >= 1 ? 'opacity-70 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <span className="text-xs tracking-[0.4em] text-stone-400 dark:text-stone-500 font-serif">
          素 · 简 · 默
        </span>
      </div>

      {/* Center poetic typography */}
      <div className="flex flex-col items-center space-y-8 my-auto">
        <div
          className={`transition-all duration-1000 ease-out flex items-center justify-center space-x-6 ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Vertical subtle decorative hairline */}
          <div className="w-[1px] h-16 bg-stone-300 dark:bg-stone-700"></div>

          <div className="space-y-3 text-center">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-[0.3em] font-serif">
              素言拟境
            </h1>
            <p className="text-sm tracking-[0.2em] text-stone-500 dark:text-stone-400 font-serif">
              言之所至 · 心之所安
            </p>
          </div>

          <div className="w-[1px] h-16 bg-stone-300 dark:bg-stone-700"></div>
        </div>

        <div
          className={`transition-all duration-1000 delay-200 text-xs text-stone-400 dark:text-stone-500 tracking-[0.25em] font-serif ${
            stage >= 3 ? 'opacity-90' : 'opacity-0'
          }`}
        >
          在寂静处，与你对话
        </div>
      </div>

      {/* Bottom prompt */}
      <div
        className={`transition-all duration-700 ${
          stage >= 3 ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="text-xs tracking-[0.3em] font-serif px-6 py-2 border border-stone-300 dark:border-stone-800 rounded-full hover:border-stone-900 dark:hover:border-stone-100 transition-colors"
        >
          轻触启幕
        </button>
      </div>
    </div>
  );
};
