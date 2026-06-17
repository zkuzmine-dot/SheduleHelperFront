import React, { useState, useEffect } from 'react';
import { ChatList, ChatWindow } from '../components/chat';
import { useAuth } from '../hooks/useAuth';
import { FiMessageSquare } from 'react-icons/fi';

function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileChatListOpen, setMobileChatListOpen] = useState(false);
  const [chatListRefreshKey, setChatListRefreshKey] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !selectedRoom) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, selectedRoom]);

  const handleSelectRoom = (room, chatData) => {
    setSelectedRoom(room);
    setSelectedChat(chatData);
    setMobileChatListOpen(false);
  };

  return (
    /* h-full — работает, т.к. родитель в App.jsx теперь h-screen overflow-y-auto */
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* Кнопка открыть список чатов — встроена в мобильный топ-бар справа */}
      <button
        onClick={() => setMobileChatListOpen(true)}
        className="lg:hidden fixed top-0 right-0 h-14 px-4 z-40 flex items-center justify-center text-slate-400 hover:text-white transition"
        aria-label="Открыть список чатов"
      >
        <FiMessageSquare size={20} />
      </button>

      {/* Область сообщений */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedRoom ? (
          <ChatWindow
            roomId={selectedRoom}
            chatData={selectedChat}
            onMessageSent={() => setChatListRefreshKey((k) => k + 1)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <FiMessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-500">Выберите чат</p>
              <p className="text-sm mt-1 text-slate-400">Откройте список чатов справа вверху</p>
            </div>
          </div>
        )}
      </div>

      {/* Список чатов — десктоп, закреплён справа */}
      <div className="hidden md:flex flex-col w-72 border-l border-slate-200 bg-white overflow-hidden flex-shrink-0">
        <ChatList
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          loading={loading}
          refreshKey={chatListRefreshKey}
        />
      </div>

      {/* Мобилка: overlay со списком чатов */}
      {mobileChatListOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMobileChatListOpen(false)}
          />
          <div className="md:hidden fixed top-14 right-0 bottom-0 w-72 z-50 bg-white flex flex-col shadow-xl overflow-hidden">
            <ChatList
              selectedRoom={selectedRoom}
              onSelectRoom={handleSelectRoom}
              loading={loading}
              refreshKey={chatListRefreshKey}
              onClose={() => setMobileChatListOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;
