import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  X,
  Maximize2,
  Edit2,
  Image as ImageIcon,
} from 'lucide-react';
import { PolaroidPhoto } from '../types';
import { getSolarTerm } from '../utils/date';

interface PolaroidGalleryAppProps {
  polaroids: PolaroidPhoto[];
  onBack: () => void;
  onUpdatePolaroids: (polaroids: PolaroidPhoto[]) => void;
}

export const PolaroidGalleryApp: React.FC<PolaroidGalleryAppProps> = ({
  polaroids,
  onBack,
  onUpdatePolaroids,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [newCaption, setNewCaption] = useState('');
  const [newDateStr, setNewDateStr] = useState('');

  // Lightbox / detail modal
  const [viewingPhoto, setViewingPhoto] = useState<PolaroidPhoto | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [editedCaptionText, setEditedCaptionText] = useState('');

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // In-app deletion modal state (No window.confirm!)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const handleSavePolaroid = () => {
    if (!newImagePreview) {
      return;
    }
    const solar = getSolarTerm(new Date());
    const tilts = [-2.2, 1.8, -1.2, 2.0, -0.8, 1.4];
    const pickedTilt = tilts[Math.floor(Math.random() * tilts.length)];

    const now = new Date();
    const dateFormatted = newDateStr.trim() || `二〇二六 · ${solar}`;

    const newPhoto: PolaroidPhoto = {
      id: `p-${Date.now()}`,
      imageUrl: newImagePreview,
      caption: newCaption.trim() || '岁序安然 · 见素抱朴',
      dateStr: dateFormatted,
      tiltDeg: pickedTilt,
      timestamp: Date.now(),
    };

    onUpdatePolaroids([newPhoto, ...polaroids]);
    setNewImagePreview('');
    setNewCaption('');
    setNewDateStr('');
    setShowAddModal(false);
  };

  const handleRequestDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingPhotoId(id);
  };

  const executeDeletePhoto = (id: string) => {
    onUpdatePolaroids(polaroids.filter((p) => p.id !== id));
    if (viewingPhoto?.id === id) {
      setViewingPhoto(null);
    }
    setDeletingPhotoId(null);
  };

  const handleUpdateCaptionInView = () => {
    if (!viewingPhoto) return;
    const updated = polaroids.map((p) =>
      p.id === viewingPhoto.id ? { ...p, caption: editedCaptionText.trim() || p.caption } : p
    );
    onUpdatePolaroids(updated);
    setViewingPhoto({ ...viewingPhoto, caption: editedCaptionText.trim() || viewingPhoto.caption });
    setEditingCaption(false);
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
          拍立得手帐 ({polaroids.length})
        </span>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-8 px-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center gap-1 text-xs font-serif hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>贴附</span>
        </button>
      </header>

      {/* Gallery Wall Background */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-6 flex flex-col pb-16">
        {/* Subtle Hanging Wall Line */}
        <div className="relative w-full border-b border-stone-300 dark:border-stone-800 mb-6">
          <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-stone-400 dark:bg-stone-600 border border-stone-200 shadow-xs" />
        </div>

        {polaroids.length === 0 ? (
          <div className="py-20 text-center text-stone-400 dark:text-stone-600 font-serif text-xs space-y-2">
            <div>挂饰手帐壁上尚无相片</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-stone-800 dark:text-stone-200 underline text-xs font-serif"
            >
              点击贴附第一张拍立得
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 justify-items-center">
            {polaroids.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  setViewingPhoto(photo);
                  setEditingCaption(false);
                  setEditedCaptionText(photo.caption);
                }}
                style={{
                  transform: `rotate(${photo.tiltDeg || 0}deg)`,
                }}
                className="group relative w-full max-w-[180px] p-2.5 pb-4 bg-stone-50 dark:bg-stone-900 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-300/80 dark:border-stone-800"
              >
                {/* Washi Tape / Wall Pin Sticker Effect */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-stone-300/80 dark:bg-stone-700/80 rounded-xs shadow-2xs backdrop-blur-xs opacity-90 group-hover:scale-105 transition-transform" />

                {/* Square Polaroid Photo Container */}
                <div className="relative aspect-square w-full bg-stone-900 overflow-hidden rounded-xs border border-stone-200/40 dark:border-stone-800">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-stone-950/5 dark:bg-stone-950/20 pointer-events-none" />
                </div>

                {/* Polaroid Chin with Custom Inscription */}
                <div className="mt-2.5 px-0.5 space-y-1 text-center">
                  <p className="text-xs font-serif font-medium text-stone-800 dark:text-stone-200 tracking-wide line-clamp-1">
                    {photo.caption}
                  </p>
                  <p className="text-[9px] font-serif text-stone-400 dark:text-stone-500 tracking-widest">
                    {photo.dateStr}
                  </p>
                </div>

                {/* Quick Delete icon (touch-friendly on mobile, hover on desktop) */}
                <button
                  onClick={(e) => handleRequestDelete(photo.id, e)}
                  title="取下照片"
                  className="absolute top-1 right-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 bg-stone-900/80 text-stone-100 rounded-full hover:bg-red-600 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Polaroid Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <span className="text-sm font-serif font-medium">贴附拍立得手帐照片</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Preview / Upload Area */}
            <div>
              {newImagePreview ? (
                <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 bg-black">
                  <img src={newImagePreview} alt="预览" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setNewImagePreview('')}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square w-full max-w-[200px] mx-auto rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 cursor-pointer p-4 text-center transition-colors">
                  <ImageIcon className="w-8 h-8 text-stone-400 mb-2 stroke-[1.2]" />
                  <span className="text-xs font-serif text-stone-600 dark:text-stone-300">
                    点击上传手帐相片
                  </span>
                  <span className="text-[10px] font-serif text-stone-400 mt-1">
                    支持各类照片与截图
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Caption Input */}
            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                手写题字
              </label>
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="例如：窗前竹影微凉"
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            {/* Date string */}
            <div>
              <label className="text-[11px] font-serif text-stone-500 block mb-1">
                时令日期（留空默认当前时令）
              </label>
              <input
                type="text"
                value={newDateStr}
                onChange={(e) => setNewDateStr(e.target.value)}
                placeholder="例如：二〇二六 · 霜降"
                className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleSavePolaroid}
                disabled={!newImagePreview}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 disabled:opacity-40"
              >
                挂饰上墙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Detail Modal */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-4 pb-6 bg-stone-50 dark:bg-stone-900 rounded-sm shadow-2xl border border-stone-300/80 dark:border-stone-700 animate-in zoom-in-95 duration-200"
          >
            {/* Top Washi Sticker */}
            <div className="w-12 h-4 bg-stone-300/90 dark:bg-stone-600/90 mx-auto -mt-6 mb-3 rounded-xs shadow-sm" />

            {/* Main Picture */}
            <div className="aspect-square w-full rounded-xs overflow-hidden bg-black border border-stone-200/50 dark:border-stone-800">
              <img
                src={viewingPhoto.imageUrl}
                alt={viewingPhoto.caption}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Inscription & Actions */}
            <div className="mt-4 px-2 space-y-2 text-center">
              {editingCaption ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editedCaptionText}
                    onChange={(e) => setEditedCaptionText(e.target.value)}
                    className="flex-1 h-8 px-2 text-xs font-serif text-center bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded"
                  />
                  <button
                    onClick={handleUpdateCaptionInView}
                    className="px-2.5 py-1 text-xs font-serif rounded bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-base font-serif font-medium text-stone-900 dark:text-stone-100 tracking-wide">
                    {viewingPhoto.caption}
                  </h4>
                  <button
                    onClick={() => {
                      setEditedCaptionText(viewingPhoto.caption);
                      setEditingCaption(true);
                    }}
                    title="修改手写题字"
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs font-serif text-stone-400 dark:text-stone-500 tracking-widest">
                {viewingPhoto.dateStr}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => handleRequestDelete(viewingPhoto.id)}
                className="text-xs font-serif text-red-500 hover:text-red-600 flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>取下销毁</span>
              </button>

              <button
                onClick={() => setViewingPhoto(null)}
                className="text-xs font-serif px-3 py-1 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                合上手帐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Deletion Safeguard Modal (Bypasses window.confirm suppression) */}
      {deletingPhotoId && (
        <div
          onClick={() => setDeletingPhotoId(null)}
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="space-y-1.5 text-center">
              <span className="text-sm font-serif font-medium text-stone-900 dark:text-stone-100 block">
                取下拍立得
              </span>
              <p className="text-xs font-serif text-stone-500 dark:text-stone-400 leading-relaxed">
                确认从手帐壁上取下并彻底销毁这张相片？
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setDeletingPhotoId(null)}
                className="px-3.5 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                保留
              </button>
              <button
                onClick={() => executeDeletePhoto(deletingPhotoId)}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认销毁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
