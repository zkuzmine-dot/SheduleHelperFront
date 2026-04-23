import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const MessageItem = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;
  const isSystemMessage = message.sender_id === null;

  // Форматирование времени
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isOwn && (
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {message.sender_full_name}
          </p>
        )}
        <p className="break-words">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
