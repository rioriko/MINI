import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveApp, AppFullState, Message, WordCard, Category, Note, WeekPlanData, PolaroidPhoto } from './types';
import {
  loadStoredState,
  saveStoredState,
  DEFAULT_INITIAL_STATE,
} from './utils/storage';
import { playMessageSound, sendWebNotification } from './utils/sound';
import { OpeningIntro } from './components/OpeningIntro';
import { HomeScreen } from './components/HomeScreen';
import { ChatApp } from './components/ChatApp';
import { CardsApp } from './components/CardsApp';
import { NotesApp } from './components/NotesApp';
import { WeeklyPlannerApp } from './components/WeeklyPlannerApp';
import { PolaroidGalleryApp } from './components/PolaroidGalleryApp';
import { SimulationApp } from './components/SimulationApp';
import { GroupApp } from './components/GroupApp';
import { AppearanceApp } from './components/AppearanceApp';
import { SoundApp } from './components/SoundApp';
import { BackupApp } from './components/BackupApp';

export default function App() {
  const [state, setState] = useState<AppFullState>(() => loadStoredState());
  const [activeApp, setActiveApp] = useState<ActiveApp>('home');
  const [showIntro, setShowIntro] = useState<boolean>(() => !state.introSeen);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const proactiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Handle Theme (System / Light / Dark)
  useEffect(() => {
    const updateTheme = () => {
      const mode = state.appearance.themeMode;
      let isDark = false;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (state.appearance.themeMode === 'system') {
        updateTheme();
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [state.appearance.themeMode]);

  // Proactive Messaging background loop
  useEffect(() => {
    if (!state.simulation.proactiveEnabled) {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
      return;
    }

    const scheduleNextProactiveMessage = () => {
      const minMinutes = Math.max(0.5, state.simulation.proactiveIntervalMin);
      const maxMinutes = Math.max(minMinutes, state.simulation.proactiveIntervalMax);
      const randomMinutes = Math.random() * (maxMinutes - minMinutes) + minMinutes;
      const delayMs = randomMinutes * 60 * 1000;

      proactiveTimerRef.current = setTimeout(() => {
        // Trigger proactive message
        const availableCards = state.cards.filter((c) => {
          if (c.blocked) return false;
          const cat = state.categories.find((cat) => cat.name === c.category);
          if (cat && cat.blocked) return false;
          return true;
        });

        if (availableCards.length > 0) {
          // Pick responder
          let responderName = state.group.partnerName;
          let responderAvatar = state.group.partnerAvatar;

          if (state.group.groupMode) {
            const activeMembers = state.group.groupMembers.filter((m) => m.active);
            if (activeMembers.length > 0) {
              const picked = activeMembers[Math.floor(Math.random() * activeMembers.length)];
              responderName = picked.name;
              responderAvatar = picked.avatar;
            }
          }

          // Pick 1-3 lines
          const count = Math.floor(
            Math.random() *
              (state.simulation.replyCountMax - state.simulation.replyCountMin + 1) +
              state.simulation.replyCountMin
          );

          const pickedTexts: string[] = [];
          for (let i = 0; i < count; i++) {
            const card = availableCards[Math.floor(Math.random() * availableCards.length)];
            pickedTexts.push(card.text);
          }

          const now = Date.now();
          let newMsgs: Message[] = [];

          if (state.simulation.concatSentenceEnabled && pickedTexts.length > 1) {
            const seps =
              state.simulation.concatSeparators.length > 0
                ? state.simulation.concatSeparators
                : ['……', '，', ' —— '];
            const sep = seps[Math.floor(Math.random() * seps.length)];
            newMsgs = [
              {
                id: `proactive-${now}`,
                sender: 'bot',
                senderName: responderName,
                senderAvatar: responderAvatar,
                text: pickedTexts.join(sep),
                timestamp: now,
                read: activeApp === 'chat', // If currently in chat, mark read immediately
              },
            ];
          } else {
            newMsgs = pickedTexts.map((txt, idx) => ({
              id: `proactive-${now + idx * 2}`,
              sender: 'bot',
              senderName: responderName,
              senderAvatar: responderAvatar,
              text: txt,
              timestamp: now + idx * 2,
              read: activeApp === 'chat',
            }));
          }

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, ...newMsgs],
          }));

          // Play sound
          playMessageSound(
            state.sound.soundEnabled,
            state.sound.randomSoundEnabled,
            state.sound.presetSound,
            state.sound.customSoundUrl,
            state.sound.volume
          );

          // Web notification
          if (state.sound.notificationEnabled) {
            sendWebNotification(responderName, newMsgs.map((m) => m.text).join('\n'));
          }
        }

        // Schedule next
        scheduleNextProactiveMessage();
      }, delayMs);
    };

    scheduleNextProactiveMessage();

    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    };
  }, [
    state.simulation.proactiveEnabled,
    state.simulation.proactiveIntervalMin,
    state.simulation.proactiveIntervalMax,
    state.simulation.replyCountMin,
    state.simulation.replyCountMax,
    state.simulation.concatSentenceEnabled,
    state.simulation.concatSeparators,
    state.cards,
    state.categories,
    state.group,
    state.sound,
    activeApp,
  ]);

  // Update Messages
  const handleUpdateMessages = useCallback((messages: Message[]) => {
    setState((prev) => ({ ...prev, messages }));
  }, []);

  // Update Cards
  const handleUpdateCards = useCallback((cards: WordCard[]) => {
    setState((prev) => ({ ...prev, cards }));
  }, []);

  // Update Categories
  const handleUpdateCategories = useCallback((categories: Category[]) => {
    setState((prev) => ({ ...prev, categories }));
  }, []);

  // Add Card
  const handleAddCard = useCallback((card: WordCard) => {
    setState((prev) => ({ ...prev, cards: [card, ...prev.cards] }));
  }, []);

  // Update Notes
  const handleUpdateNotes = useCallback((notes: Note[]) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  // Update Note Tags
  const handleUpdateNoteTags = useCallback((noteTags: string[]) => {
    setState((prev) => ({ ...prev, noteTags }));
  }, []);

  // Update Weekly Plans
  const handleUpdateWeeklyPlans = useCallback((weeklyPlans: Record<string, WeekPlanData>) => {
    setState((prev) => ({ ...prev, weeklyPlans }));
  }, []);

  // Update Polaroids
  const handleUpdatePolaroids = useCallback((polaroids: PolaroidPhoto[]) => {
    setState((prev) => ({ ...prev, polaroids }));
  }, []);

  // Toggle Theme Quick Action
  const handleToggleThemeQuick = useCallback(() => {
    const nextMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setState((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, themeMode: nextMode },
    }));
  }, [resolvedTheme]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-stone-200/70 dark:bg-black transition-colors duration-500 font-serif"
      style={{
        fontFamily:
          state.appearance.fontFamily ||
          '"Noto Serif SC", "Songti SC", "SimSun", "STSong", serif',
      }}
    >
      {/* Optional Custom Font or CSS injection */}
      {state.appearance.customFontUrl && (
        <link rel="stylesheet" href={state.appearance.customFontUrl} />
      )}
      {state.appearance.customCss && (
        <style dangerouslySetInnerHTML={{ __html: state.appearance.customCss }} />
      )}

      {/* Opening Intro Animation */}
      {showIntro && (
        <OpeningIntro
          onComplete={() => {
            setShowIntro(false);
            if (!state.introSeen) {
              setState((prev) => ({ ...prev, introSeen: true }));
            }
          }}
        />
      )}

      {/* Mobile Frame Simulation (Responsive: Full on mobile screens, elegant mobile device enclosure on desktop) */}
      <main className="w-full h-full min-h-screen sm:min-h-[840px] sm:max-h-[920px] sm:max-w-[420px] sm:my-6 sm:rounded-3xl sm:shadow-2xl sm:border sm:border-stone-300/80 dark:sm:border-stone-800 overflow-hidden flex flex-col bg-stone-100 dark:bg-stone-950 transition-all">
        {activeApp === 'home' && (
          <HomeScreen
            state={state}
            onOpenApp={(app) => setActiveApp(app)}
            onToggleTheme={handleToggleThemeQuick}
            onUpdateAppearance={(appearance) => setState((prev) => ({ ...prev, appearance }))}
            onUpdateGroup={(group) => setState((prev) => ({ ...prev, group }))}
            currentTheme={resolvedTheme}
          />
        )}

        {activeApp === 'chat' && (
          <ChatApp
            state={state}
            onBack={() => setActiveApp('home')}
            onUpdateMessages={handleUpdateMessages}
            onAddCard={handleAddCard}
          />
        )}

        {activeApp === 'cards' && (
          <CardsApp
            cards={state.cards}
            categories={state.categories}
            onBack={() => setActiveApp('home')}
            onUpdateCards={handleUpdateCards}
            onUpdateCategories={handleUpdateCategories}
          />
        )}

        {activeApp === 'notes' && (
          <NotesApp
            notes={state.notes}
            tags={state.noteTags}
            onBack={() => setActiveApp('home')}
            onUpdateNotes={handleUpdateNotes}
            onUpdateTags={handleUpdateNoteTags}
          />
        )}

        {activeApp === 'planner' && (
          <WeeklyPlannerApp
            weeklyPlans={state.weeklyPlans}
            onBack={() => setActiveApp('home')}
            onUpdateWeeklyPlans={handleUpdateWeeklyPlans}
          />
        )}

        {activeApp === 'gallery' && (
          <PolaroidGalleryApp
            polaroids={state.polaroids}
            onBack={() => setActiveApp('home')}
            onUpdatePolaroids={handleUpdatePolaroids}
          />
        )}

        {activeApp === 'simulation' && (
          <SimulationApp
            config={state.simulation}
            onBack={() => setActiveApp('home')}
            onUpdateConfig={(simulation) => setState((prev) => ({ ...prev, simulation }))}
          />
        )}

        {activeApp === 'group' && (
          <GroupApp
            config={state.group}
            onBack={() => setActiveApp('home')}
            onUpdateConfig={(group) => setState((prev) => ({ ...prev, group }))}
          />
        )}

        {activeApp === 'appearance' && (
          <AppearanceApp
            config={state.appearance}
            onBack={() => setActiveApp('home')}
            onUpdateConfig={(appearance) => setState((prev) => ({ ...prev, appearance }))}
          />
        )}

        {activeApp === 'sound' && (
          <SoundApp
            config={state.sound}
            onBack={() => setActiveApp('home')}
            onUpdateConfig={(sound) => setState((prev) => ({ ...prev, sound }))}
          />
        )}

        {activeApp === 'backup' && (
          <BackupApp
            state={state}
            onBack={() => setActiveApp('home')}
            onRestoreState={(newState) => setState(newState)}
            onReplayIntro={() => setShowIntro(true)}
          />
        )}
      </main>
    </div>
  );
}
