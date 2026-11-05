import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { DailyTask, DayOfWeekKey, WeekGoal, WeekPlanData } from '../types';
import {
  getISOWeekKey,
  getWeekDates,
  shiftWeekKey,
  getWeekRangeDisplay,
} from '../utils/date';

interface WeeklyPlannerAppProps {
  weeklyPlans: Record<string, WeekPlanData>;
  onBack: () => void;
  onUpdateWeeklyPlans: (plans: Record<string, WeekPlanData>) => void;
}

export const WeeklyPlannerApp: React.FC<WeeklyPlannerAppProps> = ({
  weeklyPlans,
  onBack,
  onUpdateWeeklyPlans,
}) => {
  const currentActualWeekKey = getISOWeekKey(new Date());
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(currentActualWeekKey);
  const [activeDayKey, setActiveDayKey] = useState<DayOfWeekKey>('mon');

  // Input states
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(7);

  // Retrieve current active week data or instantiate empty week structure
  const currentPlan: WeekPlanData = weeklyPlans[selectedWeekKey] || {
    weekKey: selectedWeekKey,
    days: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    },
    goals: [],
    summaryNote: '',
  };

  const updateCurrentPlan = (patch: Partial<WeekPlanData>) => {
    const updated = {
      ...currentPlan,
      ...patch,
    };
    onUpdateWeeklyPlans({
      ...weeklyPlans,
      [selectedWeekKey]: updated,
    });
  };

  // Week navigation
  const handlePrevWeek = () => {
    setSelectedWeekKey(shiftWeekKey(selectedWeekKey, -1));
  };

  const handleNextWeek = () => {
    setSelectedWeekKey(shiftWeekKey(selectedWeekKey, 1));
  };

  const handleJumpToCurrentWeek = () => {
    setSelectedWeekKey(currentActualWeekKey);
  };

  const weekDays = getWeekDates(selectedWeekKey);

  // Task actions for active day
  const handleAddTask = () => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      text: trimmed,
      completed: false,
    };
    const dayTasks = currentPlan.days[activeDayKey] || [];
    updateCurrentPlan({
      days: {
        ...currentPlan.days,
        [activeDayKey]: [...dayTasks, newTask],
      },
    });
    setNewTaskText('');
  };

  const toggleTaskComplete = (day: DayOfWeekKey, taskId: string) => {
    const dayTasks = currentPlan.days[day] || [];
    updateCurrentPlan({
      days: {
        ...currentPlan.days,
        [day]: dayTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
      },
    });
  };

  const handleDeleteTask = (day: DayOfWeekKey, taskId: string) => {
    const dayTasks = currentPlan.days[day] || [];
    updateCurrentPlan({
      days: {
        ...currentPlan.days,
        [day]: dayTasks.filter((t) => t.id !== taskId),
      },
    });
  };

  // Goal actions
  const handleAddGoal = () => {
    const trimmed = newGoalTitle.trim();
    if (!trimmed) return;
    const newGoal: WeekGoal = {
      id: `goal-${Date.now()}`,
      title: trimmed,
      targetCount: Math.max(1, newGoalTarget),
      currentCount: 0,
      completed: false,
    };
    updateCurrentPlan({
      goals: [...(currentPlan.goals || []), newGoal],
    });
    setNewGoalTitle('');
    setShowAddGoal(false);
  };

  const incrementGoal = (goalId: string, delta: number) => {
    const updatedGoals = (currentPlan.goals || []).map((g) => {
      if (g.id !== goalId) return g;
      const nextCount = Math.max(0, Math.min(g.targetCount, g.currentCount + delta));
      return {
        ...g,
        currentCount: nextCount,
        completed: nextCount >= g.targetCount,
      };
    });
    updateCurrentPlan({ goals: updatedGoals });
  };

  const handleDeleteGoal = (goalId: string) => {
    updateCurrentPlan({
      goals: (currentPlan.goals || []).filter((g) => g.id !== goalId),
    });
  };

  // Calculate weekly statistics
  const allTasks = Object.values(currentPlan.days).flat();
  const completedTasksCount = allTasks.filter((t) => t.completed).length;
  const totalTasksCount = allTasks.length;
  const taskRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const completedGoalsCount = (currentPlan.goals || []).filter((g) => g.completed).length;
  const totalGoalsCount = (currentPlan.goals || []).length;

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

        <span className="text-sm font-serif font-medium tracking-wide">
          周规日程系统
        </span>

        {selectedWeekKey !== currentActualWeekKey ? (
          <button
            onClick={handleJumpToCurrentWeek}
            className="text-[11px] font-serif px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>本周</span>
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-4 flex flex-col space-y-4 pb-12">
        {/* Week Navigator & Roaming Banner */}
        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <button
            onClick={handlePrevWeek}
            title="漫游至上一周"
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <span className="text-xs font-serif font-medium tracking-wide block">
              {getWeekRangeDisplay(selectedWeekKey)}
            </span>
            <span className="text-[10px] font-serif text-stone-400 dark:text-stone-500">
              任务完成率 {taskRate}%（{completedTasksCount}/{totalTasksCount}）
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            title="漫游至下一周"
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day of Week Selector: 月曜日 ~ 日曜日 */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const isSelected = activeDayKey === d.key;
            const dayTasks = currentPlan.days[d.key] || [];
            const doneCount = dayTasks.filter((t) => t.completed).length;

            return (
              <button
                key={d.key}
                onClick={() => setActiveDayKey(d.key)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                }`}
              >
                <span className="text-[11px] font-serif font-medium">
                  {d.name.slice(0, 1)}曜
                </span>
                <span className="text-[9px] font-mono opacity-60 mt-0.5">
                  {d.dateStr}
                </span>
                {dayTasks.length > 0 && (
                  <span
                    className={`mt-1 text-[9px] font-mono px-1 rounded-full ${
                      isSelected
                        ? 'bg-stone-700 text-stone-200 dark:bg-stone-200 dark:text-stone-800'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                    }`}
                  >
                    {doneCount}/{dayTasks.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Day Tasks List */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span className="text-xs font-serif font-medium">
                {weekDays.find((d) => d.key === activeDayKey)?.name}待办事项
              </span>
            </div>
            <span className="text-[11px] font-serif text-stone-400">
              {(currentPlan.days[activeDayKey] || []).filter((t) => t.completed).length} /{' '}
              {(currentPlan.days[activeDayKey] || []).length} 已毕
            </span>
          </div>

          {/* Quick Add Task */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              placeholder={`为${weekDays.find((d) => d.key === activeDayKey)?.name}安排待办...`}
              className="flex-1 h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />
            <button
              onClick={handleAddTask}
              className="h-8 px-3 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-serif flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>排定</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-1.5 pt-1">
            {(currentPlan.days[activeDayKey] || []).length === 0 ? (
              <div className="py-6 text-center text-xs font-serif text-stone-400">
                当日尚无待办安排
              </div>
            ) : (
              (currentPlan.days[activeDayKey] || []).map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded-lg border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 flex items-center justify-between group transition-colors"
                >
                  <button
                    onClick={() => toggleTaskComplete(activeDayKey, task.id)}
                    className="flex items-center gap-2.5 flex-1 text-left"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-stone-900 dark:text-stone-100 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-serif leading-relaxed ${
                        task.completed
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {task.text}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(activeDayKey, task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-opacity"
                    title="移除待办"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Habit & Goals Tracker */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span className="text-xs font-serif font-medium">周度目标打卡</span>
            </div>
            <button
              onClick={() => setShowAddGoal(true)}
              className="text-xs font-serif px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>新目标</span>
            </button>
          </div>

          <div className="space-y-2">
            {(currentPlan.goals || []).length === 0 ? (
              <div className="py-4 text-center text-xs font-serif text-stone-400">
                暂无周目标打卡项
              </div>
            ) : (
              (currentPlan.goals || []).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));

                return (
                  <div
                    key={goal.id}
                    className="p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-serif mb-1">
                        <span
                          className={`font-medium ${
                            goal.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {goal.title}
                        </span>
                        <span className="text-[11px] font-mono text-stone-500">
                          {goal.currentCount}/{goal.targetCount} 次
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-800 dark:bg-stone-200 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Counter Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => incrementGoal(goal.id, -1)}
                        disabled={goal.currentCount <= 0}
                        className="w-6 h-6 rounded border border-stone-300 dark:border-stone-700 flex items-center justify-center text-xs font-mono disabled:opacity-30"
                      >
                        -
                      </button>
                      <button
                        onClick={() => incrementGoal(goal.id, 1)}
                        disabled={goal.currentCount >= goal.targetCount}
                        className="w-6 h-6 rounded border border-stone-300 dark:border-stone-700 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-xs font-mono disabled:opacity-30"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors ml-1"
                        title="删除目标"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Report & Retrospective Review (周报独立归档) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2">
            <FileText className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <span className="text-xs font-serif font-medium">周度述职与省思札记</span>
          </div>

          <textarea
            value={currentPlan.summaryNote || ''}
            onChange={(e) => updateCurrentPlan({ summaryNote: e.target.value })}
            placeholder="在此记录本周完成心得、复盘与心境记录（随周独立隔离保存）..."
            rows={3}
            className="w-full p-2.5 text-xs font-serif leading-relaxed bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Add Weekly Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <span className="text-sm font-serif font-medium">设定本周打卡目标</span>

            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                目标名称
              </label>
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="例如：每日清心静坐15分钟"
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                周度目标达成频次
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(parseInt(e.target.value, 10) || 1)}
                className="w-full h-8 px-2.5 text-xs font-mono bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleAddGoal}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                设定目标
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
