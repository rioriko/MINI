import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, User, Users, Check, X, Upload, Camera } from 'lucide-react';
import { GroupConfig, GroupMember } from '../types';
import { isAvatarImage, resizeImageFile } from '../utils/storage';

interface GroupAppProps {
  config: GroupConfig;
  onBack: () => void;
  onUpdateConfig: (config: GroupConfig) => void;
}

export const GroupApp: React.FC<GroupAppProps> = ({
  config,
  onBack,
  onUpdateConfig,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const update = (patch: Partial<GroupConfig>) => {
    onUpdateConfig({ ...config, ...patch });
  };

  // Upload avatar for 1-on-1 partner
  const handlePartnerAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 256, 0.85);
      update({ partnerAvatar: dataUrl });
    } catch {
      showToast('图片读取失败');
    }
  };

  // Upload avatar for existing group member
  const handleMemberAvatarUpload = async (
    memberId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 256, 0.85);
      update({
        groupMembers: config.groupMembers.map((m) =>
          m.id === memberId ? { ...m, avatar: dataUrl } : m
        ),
      });
    } catch {
      showToast('图片读取失败');
    }
  };

  // Upload avatar when adding a new member
  const handleNewMemberAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 256, 0.85);
      setNewMemberAvatar(dataUrl);
    } catch {
      showToast('图片读取失败');
    }
  };

  const handleAddMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    const finalAvatar = isAvatarImage(newMemberAvatar)
      ? newMemberAvatar
      : (newMemberAvatar.trim() || trimmed).slice(0, 1);

    const newMember: GroupMember = {
      id: `m-${Date.now()}`,
      name: trimmed,
      avatar: finalAvatar,
      active: true,
      weight: 1,
    };
    update({ groupMembers: [...config.groupMembers, newMember] });
    setNewMemberName('');
    setNewMemberAvatar('');
    setShowAddModal(false);
  };

  const handleDeleteMember = (id: string) => {
    if (config.groupMembers.length <= 1) {
      showToast('至少保留一名群成员');
      return;
    }
    update({ groupMembers: config.groupMembers.filter((m) => m.id !== id) });
  };

  const toggleMemberActive = (id: string) => {
    update({
      groupMembers: config.groupMembers.map((m) =>
        m.id === id ? { ...m, active: !m.active } : m
      ),
    });
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
          {config.groupMode ? '群聊名册' : '通讯设定'}
        </span>

        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="p-2.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-serif text-center animate-in fade-in duration-200">
            {toastMsg}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            {config.groupMode ? (
              <Users className="w-5 h-5 text-stone-700 dark:text-stone-300 stroke-[1.5]" />
            ) : (
              <User className="w-5 h-5 text-stone-700 dark:text-stone-300 stroke-[1.5]" />
            )}
            <div>
              <span className="text-xs font-serif font-medium block">
                {config.groupMode ? '已开启多人群聊' : '单人对话模式'}
              </span>
              <span className="text-[10px] font-serif text-stone-400">
                {config.groupMode ? '消息随机分派给群成员' : '仅与单一设定对象交谈'}
              </span>
            </div>
          </div>

          <button
            onClick={() => update({ groupMode: !config.groupMode })}
            className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
              config.groupMode ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white dark:bg-stone-900 transition-transform ${
                config.groupMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 1-on-1 Persona Setup */}
        {!config.groupMode ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
            <span className="text-xs font-serif font-medium block border-b border-stone-100 dark:border-stone-800 pb-2">
              单人对话对象设定
            </span>

            {/* Avatar upload & Preview for 1-on-1 */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60">
              <div className="relative w-14 h-14 rounded-full border-2 border-stone-200 dark:border-stone-700 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {isAvatarImage(config.partnerAvatar) ? (
                  <img
                    src={config.partnerAvatar}
                    alt={config.partnerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-serif font-medium">
                    {config.partnerAvatar.trim().slice(0, 1) ||
                      config.partnerName.slice(0, 1) ||
                      '默'}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <span className="text-xs font-serif font-medium block">对话头像</span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 text-[11px] font-serif flex items-center gap-1.5 transition-opacity shadow-2xs">
                    <Upload className="w-3 h-3" />
                    <span>上传头像图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePartnerAvatarUpload}
                      className="hidden"
                    />
                  </label>

                  {isAvatarImage(config.partnerAvatar) && (
                    <button
                      type="button"
                      onClick={() =>
                        update({ partnerAvatar: config.partnerName.slice(0, 1) || '默' })
                      }
                      className="px-2 py-1 text-[11px] font-serif text-stone-400 hover:text-red-500 transition-colors"
                    >
                      恢复单字
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-serif text-stone-500 block mb-1">
                  对象称谓
                </label>
                <input
                  type="text"
                  value={config.partnerName}
                  onChange={(e) => update({ partnerName: e.target.value })}
                  placeholder="如：林默"
                  className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-serif text-stone-500 block mb-1">
                  单字头像（备用）
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={isAvatarImage(config.partnerAvatar) ? '' : config.partnerAvatar}
                  onChange={(e) => update({ partnerAvatar: e.target.value })}
                  placeholder={config.partnerName.slice(0, 1) || '默'}
                  className="w-full h-8 px-2.5 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none text-center"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Group Members Roster */
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <span className="text-xs font-serif font-medium">
                群成员名册 ({config.groupMembers.length})
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-serif px-2.5 py-1 rounded bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3 h-3" />
                <span>添加成员</span>
              </button>
            </div>

            <div className="space-y-2">
              {config.groupMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    member.active
                      ? 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700'
                      : 'bg-stone-100/50 dark:bg-stone-900/40 border-dashed border-stone-200 dark:border-stone-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Member Avatar with direct change on click */}
                    <div className="relative group cursor-pointer shrink-0">
                      <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs font-serif font-medium text-stone-800 dark:text-stone-200 overflow-hidden border border-stone-300 dark:border-stone-600">
                        {isAvatarImage(member.avatar) ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.avatar || member.name.slice(0, 1)
                        )}
                      </div>
                      <label
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
                        title="点击更换群员头像"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMemberAvatarUpload(member.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="text-xs font-serif font-medium block">
                        {member.name}
                      </span>
                      <span className="text-[10px] font-serif text-stone-400">
                        {member.active ? '发言活跃' : '已静音'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      className="cursor-pointer p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                      title="上传群员头像图片"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleMemberAvatarUpload(member.id, e)}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => toggleMemberActive(member.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-serif transition-colors ${
                        member.active
                          ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                          : 'bg-stone-300 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {member.active ? '活跃中' : '静音'}
                    </button>

                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      title="移除群员"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Group Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <span className="text-sm font-serif font-medium block">添加新群员</span>

            {/* Avatar upload for new member */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60">
              <div className="w-14 h-14 rounded-full border border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-700 flex items-center justify-center overflow-hidden text-sm font-serif font-medium text-stone-800 dark:text-stone-200 shadow-xs">
                {isAvatarImage(newMemberAvatar) ? (
                  <img src={newMemberAvatar} alt="群员头像" className="w-full h-full object-cover" />
                ) : (
                  newMemberAvatar.trim().slice(0, 1) || newMemberName.slice(0, 1) || '新'
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-90 text-[11px] font-serif flex items-center gap-1.5 transition-opacity shadow-2xs">
                  <Upload className="w-3 h-3" />
                  <span>上传头像图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewMemberAvatarUpload}
                    className="hidden"
                  />
                </label>
                {isAvatarImage(newMemberAvatar) && (
                  <button
                    type="button"
                    onClick={() => setNewMemberAvatar('')}
                    className="px-2 py-1 text-[11px] font-serif text-stone-400 hover:text-red-500 transition-colors"
                  >
                    清除图片
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">群员称谓</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="例如：苏合"
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-stone-500 mb-1">单字头像（备用）</label>
              <input
                type="text"
                maxLength={2}
                value={isAvatarImage(newMemberAvatar) ? '' : newMemberAvatar}
                onChange={(e) => setNewMemberAvatar(e.target.value)}
                placeholder={newMemberName.slice(0, 1) || '合'}
                className="w-full p-2 text-xs font-serif bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none text-center"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMemberAvatar('');
                  setNewMemberName('');
                }}
                className="px-3 py-1.5 text-xs font-serif rounded-lg border border-stone-300 dark:border-stone-700"
              >
                取消
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-1.5 text-xs font-serif rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
