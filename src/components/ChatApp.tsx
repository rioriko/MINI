import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Mic,
  BookmarkPlus,
  Trash2,
  X,
  CornerDownRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { AppFullState, Message, QuotedMessage, WordCard } from '../types';
import { playMessageSound, sendWebNotification } from '../utils/sound';
import { isAvatarImage } from '../utils/storage';

interface ChatAppProps {
  state: AppFullState;
  onBack: () => void;
  onUpdateMessages: (messages: Message[]) => void;
  onAddCard: (card: WordCard) => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({
  state,
  onBack,
  onUpdateMessages,
  onAddCard,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState('');
  const [activeTimestampMsgId, setActiveTimestampMsgId] = useState<string | null>(null);
  const [quotingMsg, setQuotingMsg] = useState<QuotedMessage | null>(null);

  // Modal to add user message to card library
  const [editingCardMsg, setEditingCardMsg] = useState<Message | null>(null);
  const [cardText, setCardText] = useState('');
  const [cardCategory, setCardCategory] = useState('');

  // Quick word card selector drawer
  const [showCardPicker, setShowCardPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [state.messages, isTyping]);

  // Mark all unread messages as read when opening chat
  useEffect(() => {
    const hasUnread = state.messages.some((m) => m.sender === 'bot' && !m.read);
    if (hasUnread) {
      const updated = state.messages.map((m) =>
        m.sender === 'bot' && !m.read ? { ...m, read: true } : m
      );
      onUpdateMessages(updated);
    }
  }, []);

  // Pick an active group member or single partner
  const pickResponder = () => {
    if (state.group.groupMode) {
      const activeMembers = state.group.groupMembers.filter((m) => m.active);
      if (activeMembers.length > 0) {
        // Weighted random selection
        const totalWeight = activeMembers.reduce((sum, m) => sum + (m.weight || 1), 0);
        let rand = Math.random() * totalWeight;
        for (const m of activeMembers) {
          rand -= m.weight || 1;
          if (rand <= 0) {
            return { name: m.name, avatar: m.avatar };
          }
        }
        return { name: activeMembers[0].name, avatar: activeMembers[0].avatar };
      }
    }
    return { name: state.group.partnerName, avatar: state.group.partnerAvatar };
  };

  // Helper to trigger bot reply
  const triggerBotReply = (userMsg?: Message) => {
    const responder = pickResponder();
    setTypingName(responder.name);
    setIsTyping(true);

    // Calculate delay in seconds
    const minD = Math.max(0.5, state.simulation.delayMin);
    const maxD = Math.max(minD, state.simulation.delayMax);
    const delayMs = (Math.random() * (maxD - minD) + minD) * 1000;

    setTimeout(() => {
      setIsTyping(false);

      // Check "已读不回" (Read without reply)
      if (state.simulation.readWithoutReplyEnabled) {
        const rate = state.simulation.readWithoutReplyRate / 100;
        if (Math.random() < rate) {
          // Leaves on read, no message generated!
          return;
        }
      }

      // Check available unblocked word cards
      const availableCards = state.cards.filter((c) => {
        if (c.blocked) return false;
        const cat = state.categories.find((cat) => cat.name === c.category);
        if (cat && cat.blocked) return false;
        return true;
      });

      if (availableCards.length === 0) {
        return;
      }

      // Determine number of lines (1 to 3)
      const count = Math.floor(
        Math.random() * (state.simulation.replyCountMax - state.simulation.replyCountMin + 1) +
          state.simulation.replyCountMin
      );

      // Pick randomly
      const pickedTexts: string[] = [];
      for (let i = 0; i < count; i++) {
        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        pickedTexts.push(randomCard.text);
      }

      // Determine quote reply
      let quoteToUse: QuotedMessage | undefined = undefined;
      if (state.simulation.quoteReplyEnabled) {
        const quoteRate = state.simulation.quoteReplyRate / 100;
        if (Math.random() < quoteRate) {
          // Pick one from user's last 10 messages
          const userMessages = state.messages
            .filter((m) => m.sender === 'user')
            .slice(-10);
          if (userMessages.length > 0) {
            const target = userMessages[Math.floor(Math.random() * userMessages.length)];
            quoteToUse = {
              id: target.id,
              text: target.text,
              sender: 'user',
              senderName: target.senderName,
            };
          } else if (userMsg) {
            quoteToUse = {
              id: userMsg.id,
              text: userMsg.text,
              sender: 'user',
              senderName: userMsg.senderName,
            };
          }
        }
      }

      // Handle concatenation (连句功能)
      const now = Date.now();
      let newMessages: Message[] = [];

      if (state.simulation.concatSentenceEnabled && pickedTexts.length > 1) {
        const seps = state.simulation.concatSeparators.length > 0
          ? state.simulation.concatSeparators
          : ['……', '，', ' —— '];
        const sep = seps[Math.floor(Math.random() * seps.length)];
        const concatenatedText = pickedTexts.join(sep);

        const newMsg: Message = {
          id: `bot-msg-${now}`,
          sender: 'bot',
          senderName: responder.name,
          senderAvatar: responder.avatar,
          text: concatenatedText,
          timestamp: now,
          read: true,
          quotedMessage: quoteToUse,
        };
        newMessages = [newMsg];
      } else {
        newMessages = pickedTexts.map((txt, idx) => ({
          id: `bot-msg-${now + idx * 2}`,
          sender: 'bot',
          senderName: responder.name,
          senderAvatar: responder.avatar,
          text: txt,
          timestamp: now + idx * 2,
          read: true,
          quotedMessage: idx === 0 ? quoteToUse : undefined,
        }));
      }

      onUpdateMessages([...state.messages, ...newMessages]);

      // Play sound
      playMessageSound(
        state.sound.soundEnabled,
        state.sound.randomSoundEnabled,
        state.sound.presetSound,
        state.sound.customSoundUrl,
        state.sound.volume
      );

      // Web Notification
      if (state.sound.notificationEnabled) {
        sendWebNotification(responder.name, newMessages.map((m) => m.text).join('\n'));
      }
    }, delayMs);
  };

  // User sends text
  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMsg: Message = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
      read: true,
      quotedMessage: quotingMsg || undefined,
    };

    setInputText('');
    setQuotingMsg(null);
    const updatedMessages = [...state.messages, newMsg];
    onUpdateMessages(updatedMessages);

    // Play send sound
    playMessageSound(
      state.sound.soundEnabled,
      state.sound.randomSoundEnabled,
      state.sound.presetSound,
      state.sound.customSoundUrl,
      state.sound.volume
    );

    // Trigger bot reply
    triggerBotReply(newMsg);
  };

  // User taps "说话" button -> triggers bot without sending message!
  const handleSpeakTrigger = () => {
    triggerBotReply();
  };

  // Delete single message
  const handleDeleteMessage = (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateMessages(state.messages.filter((m) => m.id !== msgId));
  };

  // In-app confirm for clear chat
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Clear all messages
  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const executeClearAll = () => {
    onUpdateMessages([]);
    setShowClearConfirm(false);
  };

  // Click user message -> open quick add to word card modal
  const handleUserMessageClick = (msg: Message) => {
    setEditingCardMsg(msg);
    setCardText(msg.text);
    setCardCategory(state.categories[0]?.name || '日常问候');
  };

  const handleSaveCardFromMsg = () => {
    if (!cardText.trim()) return;
    const newCard: WordCard = {
      id: `c-added-${Date.now()}`,
      text: cardText.trim(),
      category: cardCategory || '快捷收藏',
      blocked: false,
      createdAt: Date.now(),
    };
    onAddCard(newCard);
    setEditingCardMsg(null);
  };

  // Format timestamp
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // Get bubble styling based on appearance setting
  const getBubbleStyle = (isUser: boolean) => {
    switch (state.appearance.bubbleStyle) {
      case 'bordered':
        return isUser
          ? 'bg-stone-200/90 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700'
          : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800';
      case 'contrast':
        return isUser
          ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900'
          : 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100';
      case 'rounded':
        return isUser
          ? 'rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900'
          : 'rounded-2xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800';
      case 'minimal':
      default:
        return isUser
          ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg'
          : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-lg';
    }
  };

  // Text size class
  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[state.appearance.fontSize || 'md'];

  return (
    <div
      className="relative w-full h-full min-h-screen flex flex-col justify-between bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 select-none overflow-hidden transition-colors duration-300"
      style={
        state.appearance.chatBackground
          ? {
              backgroundImage: `url(${state.appearance.chatBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-stone-100/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-50 rounded-lg transition-colors flex items-center gap-1"
            aria-label="返回桌面"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            <span className="text-xs font-serif tracking-wider">桌面</span>
          </button>
        </div>

        {/* Center Name & Status */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-serif font-medium tracking-wide">
            {state.group.groupMode ? '群聊对话' : state.group.partnerName}
          </span>
          <span className="text-[11px] font-serif text-stone-400 dark:text-stone-500 tracking-wider">
            {isTyping
              ? state.simulation.typingIndicatorText || '对方正在输入...'
              : state.group.groupMode
              ? `${state.group.groupMembers.filter((m) => m.active).length} 位成员在线`
              : '在线'}
          </span>
        </div>

        {/* Right Action: Clear Chat */}
        <div className="flex items-center">
          <button
            onClick={handleClearAll}
            title="清空所有记录"
            className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <Trash2 className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </header>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {state.messages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 dark:text-stone-600 space-y-2">
            <span className="text-sm font-serif tracking-widest">暂无记录</span>
            <span className="text-xs font-serif tracking-wide text-stone-400 dark:text-stone-500">
              点击下方说话按钮开始对话
            </span>
          </div>
        ) : (
          state.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const showTimestamp =
              state.appearance.showTimestampDefault || activeTimestampMsgId === msg.id;

            return (
              <div
                key={msg.id}
                onClick={() => {
                  // Toggle timestamp visibility on click
                  setActiveTimestampMsgId(activeTimestampMsgId === msg.id ? null : msg.id);
                }}
                className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'} cursor-pointer`}
              >
                {/* Optional Sender Name */}
                {!isUser && state.appearance.showName && msg.senderName && (
                  <span className="text-[11px] font-serif text-stone-500 dark:text-stone-400 mb-1 ml-9 tracking-wider">
                    {msg.senderName}
                  </span>
                )}

                <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Optional Avatar */}
                  {state.appearance.showAvatar && (
                    <div
                      className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-serif select-none overflow-hidden ${
                        isUser
                          ? 'bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700'
                      }`}
                    >
                      {isUser ? (
                        '我'
                      ) : isAvatarImage(msg.senderAvatar) ? (
                        <img src={msg.senderAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (msg.senderAvatar || '彼').slice(0, 1)
                      )}
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className="flex flex-col relative">
                    {/* Quoted message preview if available */}
                    {msg.quotedMessage && (
                      <div
                        className={`mb-1 px-2.5 py-1 text-xs rounded border-l-2 bg-stone-200/50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 line-clamp-2 ${
                          isUser ? 'border-stone-500 self-end text-right' : 'border-stone-400 self-start'
                        }`}
                      >
                        <span className="font-serif">
                          {msg.quotedMessage.sender === 'user' ? '「我」' : `「${msg.quotedMessage.senderName || '对方'}」`}
                        </span>
                        ：{msg.quotedMessage.text}
                      </div>
                    )}

                    {/* Actual Text Bubble */}
                    <div
                      onClick={(e) => {
                        if (isUser) {
                          e.stopPropagation();
                          handleUserMessageClick(msg);
                        }
                      }}
                      title={isUser ? '点击收录此句至字卡库' : undefined}
                      className={`relative px-3.5 py-2.5 shadow-sm transition-all ${textSizeClass} ${getBubbleStyle(
                        isUser
                      )}`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed tracking-wide font-serif">
                        {msg.text}
                      </p>
                    </div>

                    {/* Meta: Read receipt and timestamp */}
                    <div
                      className={`flex items-center gap-1.5 mt-1 text-[10px] text-stone-400 dark:text-stone-500 font-serif ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* Read status (for user sent messages) */}
                      {isUser && state.appearance.showReadStatus && (
                        <span>{state.appearance.readStatusText || '已读'}</span>
                      )}

                      {/* Timestamp (hidden by default unless clicked or setting turned on) */}
                      {showTimestamp && (
                        <span>{formatTime(msg.timestamp)}</span>
                      )}

                      {/* Quick delete button on hover/tap */}
                      <button
                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                        title="删除该消息"
                      >
                        <Trash2 className="w-3 h-3 stroke-[1.4]" />
                      </button>

                      {/* Quick quote button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuotingMsg({
                            id: msg.id,
                            text: msg.text,
                            sender: msg.sender,
                            senderName: msg.senderName,
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-stone-800 dark:hover:text-stone-200 transition-opacity p-0.5"
                        title="引用该消息回复"
                      >
                        <CornerDownRight className="w-3 h-3 stroke-[1.4]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex items-end gap-2 animate-pulse">
            {state.appearance.showAvatar && (
              <div className="w-7 h-7 shrink-0 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs font-serif border border-stone-300 dark:border-stone-700">
                {(typingName || '彼').slice(0, 1)}
              </div>
            )}
            <div className="px-3.5 py-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 font-serif flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 tracking-wider">
                {state.simulation.typingIndicatorText || '对方正在输入...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar: Quoting Preview if active */}
      {quotingMsg && (
        <div className="max-w-2xl w-full mx-auto px-4 py-1.5 bg-stone-200 dark:bg-stone-900 border-t border-stone-300 dark:border-stone-800 flex items-center justify-between text-xs font-serif text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              引用：{quotingMsg.text}
            </span>
          </div>
          <button
            onClick={() => setQuotingMsg(null)}
            className="p-1 hover:text-stone-950 dark:hover:text-stone-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Chat Bar (Buttons outside input limited to <= 3!) */}
      <footer className="sticky bottom-0 z-30 p-3 bg-stone-100/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl w-full mx-auto flex items-center gap-2">
          {/* Button 1: 说话 (Speak Trigger Button - Triggers other person to speak directly) */}
          <button
            onClick={handleSpeakTrigger}
            disabled={isTyping}
            title="点击说话，触发对方自然回应"
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Mic className="w-4 h-4 stroke-[1.6]" />
          </button>

          {/* Button 2: 快捷字卡库 (Quick Word Card Drawer) */}
          <button
            onClick={() => setShowCardPicker(!showCardPicker)}
            title="从字卡库中选取发送"
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 stroke-[1.6]" />
          </button>

          {/* Input text container */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="轻触书写..."
              className="w-full h-10 px-3.5 pr-10 text-sm font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-full text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors"
            />
            {inputText.trim() && (
              <button
                onClick={handleSendMessage}
                className="absolute right-1.5 w-7 h-7 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Quick Word Card Picker Modal / Popover */}
      {showCardPicker && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl border-t border-stone-200 dark:border-stone-800 max-h-[60vh] flex flex-col p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <span className="text-sm font-serif font-medium tracking-wider">
                选取字卡发送
              </span>
              <button
                onClick={() => setShowCardPicker(false)}
                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {state.cards.filter((c) => !c.blocked).map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setInputText(card.text);
                    setShowCardPicker(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/70 dark:border-stone-700/60 transition-colors flex items-center justify-between text-xs font-serif"
                >
                  <span className="text-stone-800 dark:text-stone-200 line-clamp-2">
                    {card.text}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0 ml-2">
                    {card.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add User Message to Word Card Library */}
      {editingCardMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                <span className="text-sm font-serif font-medium">收录至字卡库</span>
              </div>
              <button
                onClick={() => setEditingCardMsg(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">字卡内容</label>
              <textarea
                value={cardText}
                onChange={(e) => setCardText(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">所属分类</label>
              <select
                value={cardCategory}
                onChange={(e) => setCardCategory(e.target.value)}
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                {state.categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCardMsg(null)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveCardFromMsg}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
              >
                确认收录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat In-App Confirmation Modal */}
      {showClearConfirm && (
        <div
          onClick={() => setShowClearConfirm(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="space-y-1.5 text-center">
              <span className="text-sm font-serif font-medium text-stone-900 dark:text-stone-100 block">
                清空对话记录
              </span>
              <p className="text-xs font-serif text-stone-500 dark:text-stone-400 leading-relaxed">
                确认清空所有对话记录？此操作不可撤销。
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeClearAll}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
