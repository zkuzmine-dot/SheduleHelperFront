import React, { useEffect, useRef, useState } from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { abbreviateName } from '../../utils/formatName';

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const MessageItem = ({ message, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;
  const isSystem = message.sender_id === null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setConfirmingDelete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const canEdit = isOwn && Date.now() - new Date(message.created_at).getTime() < EDIT_WINDOW_MS;

  const startEdit = () => {
    setEditValue(message.content);
    setEditing(true);
    setMenuOpen(false);
    setConfirmingDelete(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditValue(message.content);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content) {
      setEditing(false);
      return;
    }
    onEdit?.(message.id, trimmed);
    setEditing(false);
  };

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      onDelete?.(message.id);
      setMenuOpen(false);
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div className={`flex items-start gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
          }`}
        >
          {!isOwn && (
            <p className="text-xs font-semibold text-blue-600 mb-1">
              {abbreviateName(message.sender_full_name)}
            </p>
          )}

          {editing ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 rounded-lg text-sm text-slate-800 bg-white/90 focus:outline-none resize-none"
              />
              <div className="flex justify-end gap-1.5">
                <button onClick={cancelEdit} className="p-1 rounded hover:bg-white/20" title="Отмена">
                  <FiX size={14} />
                </button>
                <button onClick={saveEdit} className="p-1 rounded hover:bg-white/20" title="Сохранить">
                  <FiCheck size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p className="break-words leading-relaxed">{message.content}</p>
          )}

          <p className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
            {message.edited_at && <span>ред.</span>}
            {formatTime(message.created_at)}
          </p>
        </div>

        {isOwn && !editing && (
          <div ref={menuRef} className="relative self-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <FiMoreVertical size={14} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40 z-10 text-left">
                {canEdit && (
                  <button
                    onClick={startEdit}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <FiEdit2 size={12} /> Редактировать
                  </button>
                )}
                <button
                  onClick={handleDeleteClick}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-red-50 ${
                    confirmingDelete ? 'text-red-600 font-medium' : 'text-red-500'
                  }`}
                >
                  <FiTrash2 size={12} /> {confirmingDelete ? 'Подтвердить?' : 'Удалить'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
