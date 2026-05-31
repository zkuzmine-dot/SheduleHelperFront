import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const MessageItem = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;
  const isSystem = message.sender_id === null;

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

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-blue-600 mb-1">
            {message.sender_full_name}
          </p>
        )}
        <p className="break-words leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
