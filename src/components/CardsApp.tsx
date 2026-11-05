import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  EyeOff,
  Eye,
  FolderInput,
  Sparkles,
  Download,
  Upload,
  CheckSquare,
  Square,
  Edit2,
  X,
  Layers,
} from 'lucide-react';
import { Category, WordCard } from '../types';
import {
  exportCardsToTxt,
  parseCardsFromTxt,
  deduplicateCards,
} from '../utils/storage';

interface CardsAppProps {
  cards: WordCard[];
  categories: Category[];
  onBack: () => void;
  onUpdateCards: (cards: WordCard[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
}

export const CardsApp: React.FC<CardsAppProps> = ({
  cards,
  categories,
  onBack,
  onUpdateCards,
  onUpdateCategories,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'time-desc' | 'time-asc' | 'alpha' | 'length'>('time-desc');

  // Batch management mode
  const [batchMode, setBatchMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  // Modal states
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [singleText, setSingleText] = useState('');
  const [singleCategory, setSingleCategory] = useState(categories[0]?.name || '日常问候');

  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [batchText, setBatchText] = useState('');

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetCategory, setTargetCategory] = useState(categories[0]?.name || '日常问候');

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Filter & Search & Sort
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        if (selectedCat !== 'all' && card.category !== selectedCat) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return card.text.toLowerCase().includes(q) || card.category.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time-desc') return b.createdAt - a.createdAt;
        if (sortBy === 'time-asc') return a.createdAt - b.createdAt;
        if (sortBy === 'length') return a.text.length - b.text.length;
        if (sortBy === 'alpha') return a.text.localeCompare(b.text, 'zh-Hans-CN');
        return 0;
      });
  }, [cards, selectedCat, searchQuery, sortBy]);

  // Actions
  const toggleCardBlock = (id: string) => {
    onUpdateCards(cards.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
  };

  const deleteCard = (id: string) => {
    onUpdateCards(cards.filter((c) => c.id !== id));
  };

  const toggleCategoryBlock = (catName: string) => {
    onUpdateCategories(
      categories.map((c) => (c.name === catName ? { ...c, blocked: !c.blocked } : c))
    );
  };

  const deleteCategory = (catName: string) => {
    onUpdateCards(cards.filter((c) => c.category !== catName));
    onUpdateCategories(categories.filter((c) => c.name !== catName));
    if (selectedCat === catName) setSelectedCat('all');
  };

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name === trimmed)) {
      return;
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      blocked: false,
      order: categories.length + 1,
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
    setShowAddCatModal(false);
  };

  const handleAddSingleCard = () => {
    if (!singleText.trim()) return;
    const newCard: WordCard = {
      id: `c-${Date.now()}`,
      text: singleText.trim(),
      category: singleCategory || '默认',
      blocked: false,
      createdAt: Date.now(),
    };
    onUpdateCards([newCard, ...cards]);
    setSingleText('');
    setShowAddSingle(false);
  };

  const handleBatchAddCards = () => {
    if (!batchText.trim()) return;
    const { cards: newCards, newCategories } = parseCardsFromTxt(batchText, categories);
    onUpdateCategories(newCategories);
    onUpdateCards([...newCards, ...cards]);
    setBatchText('');
    setShowBatchAdd(false);
  };

  const handleDeduplicate = () => {
    const { uniqueCards } = deduplicateCards(cards);
    onUpdateCards(uniqueCards);
  };

  const handleBatchDelete = () => {
    if (selectedCardIds.size === 0) return;
    onUpdateCards(cards.filter((c) => !selectedCardIds.has(c.id)));
    setSelectedCardIds(new Set());
  };

  const handleBatchMove = () => {
    if (selectedCardIds.size === 0) return;
    onUpdateCards(
      cards.map((c) => (selectedCardIds.has(c.id) ? { ...c, category: targetCategory } : c))
    );
    setSelectedCardIds(new Set());
    setShowMoveModal(false);
  };

  const handleImportTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { cards: importedCards, newCategories } = parseCardsFromTxt(text, categories);
      onUpdateCategories(newCategories);
      onUpdateCards([...importedCards, ...cards]);
      alert(`成功导入 ${importedCards.length} 条字卡`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSelectAll = () => {
    if (selectedCardIds.size === filteredCards.length) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(filteredCards.map((c) => c.id)));
    }
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
          字卡库 ({cards.length})
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`text-xs font-serif px-2.5 py-1 rounded transition-colors ${
              batchMode
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            {batchMode ? '完成' : '批量'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 flex flex-col space-y-4">
        {/* Search & Actions bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400 stroke-[1.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="检索字卡内容或分类..."
              className="w-full h-9 pl-9 pr-3 text-xs font-serif bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleDeduplicate}
            title="自动去除重复字卡"
            className="h-9 px-2.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>去重</span>
          </button>

          <button
            onClick={() => exportCardsToTxt(cards, categories)}
            title="导出字卡为TXT"
            className="h-9 w-9 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            title="导入TXT字卡"
            className="h-9 w-9 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".txt" onChange={handleImportTxt} className="hidden" />
          </label>
        </div>

        {/* Categories Horizontal Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1 rounded-md text-xs font-serif whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-stone-400'
            }`}
          >
            全部 ({cards.length})
          </button>

          {categories.map((cat) => {
            const count = cards.filter((c) => c.category === cat.name).length;
            const isSelected = selectedCat === cat.name;

            return (
              <div
                key={cat.id}
                className={`flex items-center rounded-md border text-xs font-serif whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                }`}
              >
                <button
                  onClick={() => setSelectedCat(cat.name)}
                  className={`px-2.5 py-1 ${cat.blocked ? 'line-through opacity-60' : ''}`}
                >
                  {cat.name} ({count})
                </button>

                {isSelected && (
                  <div className="flex items-center pr-1 space-x-0.5">
                    <button
                      onClick={() => toggleCategoryBlock(cat.name)}
                      title={cat.blocked ? '解除屏蔽' : '屏蔽此分类'}
                      className="p-1 hover:opacity-75"
                    >
                      {cat.blocked ? (
                        <EyeOff className="w-3 h-3 text-red-400" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.name)}
                      title="删除此分类"
                      className="p-1 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowAddCatModal(true)}
            className="px-2.5 py-1 rounded-md text-xs font-serif border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 hover:border-stone-500 whitespace-nowrap flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>新分类</span>
          </button>
        </div>

        {/* Action bar: Add Single / Add Batch / Sort */}
        <div className="flex items-center justify-between text-xs font-serif">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddSingle(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" />
              <span>添加字卡</span>
            </button>
            <button
              onClick={() => setShowBatchAdd(true)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              批量添加
            </button>
          </div>

          <div className="flex items-center gap-1 text-stone-500">
            <span>排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
            >
              <option value="time-desc">最新添加</option>
              <option value="time-asc">最早添加</option>
              <option value="length">字数长短</option>
              <option value="alpha">首字顺序</option>
            </select>
          </div>
        </div>

        {/* Batch selection toolbar */}
        {batchMode && (
          <div className="flex items-center justify-between px-3 py-2 bg-stone-200/70 dark:bg-stone-900 rounded-lg text-xs font-serif border border-stone-300 dark:border-stone-800 animate-in fade-in">
            <button onClick={handleSelectAll} className="flex items-center gap-1.5">
              {selectedCardIds.size === filteredCards.length && filteredCards.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-stone-900 dark:text-stone-100" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              <span>全选 ({selectedCardIds.size}/{filteredCards.length})</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMoveModal(true)}
                disabled={selectedCardIds.size === 0}
                className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 disabled:opacity-40 flex items-center gap-1"
              >
                <FolderInput className="w-3 h-3" />
                <span>移动至</span>
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedCardIds.size === 0}
                className="px-2.5 py-1 rounded bg-red-600 text-white disabled:opacity-40 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>删除</span>
              </button>
            </div>
          </div>
        )}

        {/* Cards List */}
        <div className="flex-1 space-y-2 pb-8">
          {filteredCards.length === 0 ? (
            <div className="py-12 text-center text-stone-400 font-serif text-xs">
              无匹配字卡
            </div>
          ) : (
            filteredCards.map((card) => {
              const isSelected = selectedCardIds.has(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    if (batchMode) {
                      const updated = new Set(selectedCardIds);
                      if (updated.has(card.id)) updated.delete(card.id);
                      else updated.add(card.id);
                      setSelectedCardIds(updated);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all ${
                    card.blocked
                      ? 'bg-stone-200/50 dark:bg-stone-900/40 border-dashed border-stone-300 dark:border-stone-800 opacity-60'
                      : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-stone-400'
                  } ${batchMode ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start gap-2.5 justify-between">
                    <div className="flex items-start gap-2.5 flex-1">
                      {batchMode && (
                        <div className="pt-0.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                      )}

                      <div className="flex-1">
                        <p
                          className={`text-xs sm:text-sm font-serif leading-relaxed text-stone-900 dark:text-stone-100 ${
                            card.blocked ? 'line-through text-stone-400' : ''
                          }`}
                        >
                          {card.text}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400 dark:text-stone-500 font-serif">
                          <span>{card.category}</span>
                          <span>·</span>
                          <span>{card.text.length} 字</span>
                          {card.blocked && (
                            <>
                              <span>·</span>
                              <span className="text-red-400">已屏蔽</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {!batchMode && (
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <button
                          onClick={() => toggleCardBlock(card.id)}
                          title={card.blocked ? '解除屏蔽' : '屏蔽此字卡'}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        >
                          {card.blocked ? (
                            <EyeOff className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteCard(card.id)}
                          title="删除字卡"
                          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Add Single Card */}
      {showAddSingle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-serif font-medium">添加单条字卡</span>
              <button onClick={() => setShowAddSingle(false)} className="text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">字卡文案</label>
              <textarea
                value={singleText}
                onChange={(e) => setSingleText(e.target.value)}
                placeholder="在此输入字卡内容..."
                rows={3}
                className="w-full p-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">分类归属</label>
              <select
                value={singleCategory}
                onChange={(e) => setSingleCategory(e.target.value)}
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddSingle(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleAddSingleCard}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Batch Add Cards (Supports 【分组名称】 syntax) */}
      {showBatchAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm font-serif font-medium">批量录入字卡</span>
              <button onClick={() => setShowBatchAdd(false)} className="text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-serif leading-relaxed">
              每行一条字卡。以【分组名称】为标题，下方的内容即归入该分组。例如：
              <div className="mt-1 p-2 rounded bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-600 dark:text-stone-300 font-mono">
                【日常问候】<br />
                今天过得好吗？<br />
                刚回到家。<br />
                【所思随想】<br />
                有些话不一定要说完。
              </div>
            </div>

            <div className="flex-1 min-h-[160px]">
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="粘贴或编写字卡内容..."
                rows={8}
                className="w-full h-full p-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBatchAdd(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleBatchAddCards}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                导入录入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Move Cards to Category */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <span className="text-sm font-serif font-medium">移动字卡至新分组</span>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">目标分组</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleBatchMove}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                确认移动
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Category */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <span className="text-sm font-serif font-medium">新建分类</span>

            <div>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="输入分类名称（如：夜雨杂记）"
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddCatModal(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                保存分类
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
