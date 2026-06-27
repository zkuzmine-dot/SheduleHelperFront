import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';

const MAX_MESSAGE_LENGTH = 2000;

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Нет соединения...' : 'Напишите сообщение...'}
            disabled={disabled}
            maxLength={MAX_MESSAGE_LENGTH}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:bg-slate-50 disabled:text-slate-400 max-h-32 bg-white"
            rows="1"
          />
          {message.length > MAX_MESSAGE_LENGTH - 200 && (
            <span className={`absolute -bottom-4 right-1 text-[11px] ${
              message.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-slate-400'
            }`}>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition flex items-center justify-center flex-shrink-0"
        >
          <IoSend size={18} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
