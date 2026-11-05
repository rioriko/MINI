import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Tag,
  AlertTriangle,
  Clock,
  Check,
} from 'lucide-react';
import { Note } from '../types';
import { getSolarTerm, formatNoteDate } from '../utils/date';

interface NotesAppProps {
  notes: Note[];
  tags: string[];
  onBack: () => void;
  onUpdateNotes: (notes: Note[]) => void;
  onUpdateTags: (tags: string[]) => void;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  notes,
  tags,
  onBack,
  onUpdateNotes,
  onUpdateTags,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');

  // Compose / Edit Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [tagInput, setTagInput] = useState('随笔');
  const [pinnedInput, setPinnedInput] = useState(false);

  // Anti-accidental touch destroy state
  const [destroyingNoteId, setDestroyingNoteId] = useState<string | null>(null);
  const [destroyConfirmText, setDestroyConfirmText] = useState('');

  // Add custom tag modal
  const [showAddTag, setShowAddTag] = useState(false);
  const [newCustomTag, setNewCustomTag] = useState('');

  // Filter & Search & Pinned sorting
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (selectedTag !== '全部' && note.tag !== selectedTag) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            note.title.toLowerCase().includes(q) ||
            note.content.toLowerCase().includes(q) ||
            note.tag.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned first, then by timestamp descending
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [notes, selectedTag, searchQuery]);

  const handleOpenNewNote = () => {
    setEditingNote(null);
    setTitleInput('');
    setContentInput('');
    setTagInput(tags[0] || '随笔');
    setPinnedInput(false);
    setShowEditor(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setTitleInput(note.title);
    setContentInput(note.content);
    setTagInput(note.tag);
    setPinnedInput(note.pinned);
    setShowEditor(true);
  };

  const handleSaveNote = () => {
    const trimmedTitle = titleInput.trim();
    const trimmedContent = contentInput.trim();
    if (!trimmedTitle && !trimmedContent) {
      setShowEditor(false);
      return;
    }

    const solar = getSolarTerm(new Date());

    if (editingNote) {
      // Update existing
      onUpdateNotes(
        notes.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: trimmedTitle || '无题奏帖',
                content: trimmedContent,
                tag: tagInput || '随笔',
                pinned: pinnedInput,
                solarTerm: solar,
                timestamp: Date.now(),
              }
            : n
        )
      );
    } else {
      // Create new
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: trimmedTitle || '无题奏帖',
        content: trimmedContent,
        tag: tagInput || '随笔',
        pinned: pinnedInput,
        solarTerm: solar,
        timestamp: Date.now(),
      };
      onUpdateNotes([newNote, ...notes]);
    }

    setShowEditor(false);
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const handleConfirmDestroy = () => {
    if (!destroyingNoteId) return;
    onUpdateNotes(notes.filter((n) => n.id !== destroyingNoteId));
    setDestroyingNoteId(null);
    setDestroyConfirmText('');
  };

  const handleAddCustomTag = () => {
    const trimmed = newCustomTag.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onUpdateTags([...tags, trimmed]);
    }
    setTagInput(trimmed);
    setNewCustomTag('');
    setShowAddTag(false);
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

        <span className="text-sm font-serif font-medium tracking-wide">
          奏帖便签 ({notes.length})
        </span>

        <button
          onClick={handleOpenNewNote}
          className="h-8 px-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center gap-1 text-xs font-serif hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>速记</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-4 flex flex-col space-y-4">
        {/* Full-text Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400 stroke-[1.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="全文检索奏帖与标签..."
            className="w-full h-9 pl-9 pr-3 text-xs font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
        </div>

        {/* Quick Tag Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['全部', ...tags].map((t) => {
            const isSelected = selectedTag === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-md text-xs font-serif whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
                }`}
              >
                {t}
              </button>
            );
          })}

          <button
            onClick={() => setShowAddTag(true)}
            className="px-2 py-1 rounded-md text-xs font-serif border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 hover:border-stone-500 whitespace-nowrap flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>新标签</span>
          </button>
        </div>

        {/* Notes Feed */}
        <div className="flex-1 space-y-3 pb-8">
          {filteredNotes.length === 0 ? (
            <div className="py-16 text-center text-stone-400 dark:text-stone-600 font-serif text-xs">
              暂无匹配奏帖，点击右上角速记起草
            </div>
          ) : (
            filteredNotes.map((note) => {
              const dt = formatNoteDate(note.timestamp);

              return (
                <div
                  key={note.id}
                  onClick={() => handleOpenEdit(note)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    note.pinned
                      ? 'bg-white dark:bg-stone-900 border-stone-400 dark:border-stone-600 shadow-sm'
                      : 'bg-white/90 dark:bg-stone-900/90 border-stone-200 dark:border-stone-800/80 hover:border-stone-400'
                  }`}
                >
                  {/* Top Note Meta: Solar Term + Date + Pin button */}
                  <div className="flex items-center justify-between text-[11px] font-serif text-stone-500 dark:text-stone-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {note.solarTerm || '时令'}
                      </span>
                      <span>·</span>
                      <span>{dt.dateStr}</span>
                      <span>{dt.timeStr}</span>
                      <span>·</span>
                      <span className="text-stone-400 dark:text-stone-500">#{note.tag}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => togglePin(note.id, e)}
                        title={note.pinned ? '取消置顶' : '置顶奏帖'}
                        className={`p-1 transition-colors ${
                          note.pinned
                            ? 'text-stone-900 dark:text-stone-100'
                            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                        }`}
                      >
                        {note.pinned ? (
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Pin className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDestroyingNoteId(note.id);
                          setDestroyConfirmText('');
                        }}
                        title="销毁奏帖"
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-serif font-medium text-stone-900 dark:text-stone-100 mb-1.5 tracking-wide">
                    {note.title}
                  </h3>

                  {/* Body Content */}
                  <p className="text-xs font-serif text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {note.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Write & Edit Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="text-sm font-serif font-medium tracking-wider">
                {editingNote ? '二次编辑奏帖' : '快捷速记起草'}
              </span>
              <button
                onClick={() => setShowEditor(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note Title */}
            <div>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="奏帖题名..."
                className="w-full h-10 px-3 text-sm font-serif font-medium bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none"
              />
            </div>

            {/* Tag & Pinned Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none flex-1"
                >
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setPinnedInput(!pinnedInput)}
                className={`h-8 px-3 rounded-lg border text-xs font-serif flex items-center gap-1.5 transition-colors ${
                  pinnedInput
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>{pinnedInput ? '已置顶' : '置顶'}</span>
              </button>
            </div>

            {/* Content Textarea */}
            <div className="flex-1 min-h-[180px]">
              <textarea
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="在此笔录所思、摘抄或时令随笔..."
                rows={8}
                className="w-full h-full p-3 text-xs font-serif leading-relaxed bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none resize-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setShowEditor(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300"
              >
                放弃
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90"
              >
                保存奏帖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Accidental Touch Destroy Safeguard Modal */}
      {destroyingNoteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl border border-red-300 dark:border-red-900/60 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-serif font-medium">防误触销毁机制</span>
            </div>

            <p className="text-xs font-serif text-stone-600 dark:text-stone-300 leading-relaxed">
              此操作将永久抹除该篇奏帖，不可复原。若确定坚决销毁，请在下方键入“销毁”确认。
            </p>

            <input
              type="text"
              value={destroyConfirmText}
              onChange={(e) => setDestroyConfirmText(e.target.value)}
              placeholder="键入“销毁”"
              className="w-full h-9 px-3 text-xs font-serif text-center bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDestroyingNoteId(null);
                  setDestroyConfirmText('');
                }}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDestroy}
                disabled={destroyConfirmText.trim() !== '销毁'}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-red-600 text-white disabled:opacity-40 hover:bg-red-700"
              >
                确认彻底销毁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Tag Modal */}
      {showAddTag && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <span className="text-sm font-serif font-medium">新建分类标签</span>

            <input
              type="text"
              value={newCustomTag}
              onChange={(e) => setNewCustomTag(e.target.value)}
              placeholder="标签名称（如：密录）"
              className="w-full h-9 px-3 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddTag(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomTag}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                保存标签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
