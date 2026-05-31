import React, { useState, useEffect } from 'react';
import { ChatList, ChatWindow } from '../components/chat';
import { useAuth } from '../hooks/useAuth';
import { FiMessageSquare, FiX } from 'react-icons/fi';

function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileChatListOpen, setMobileChatListOpen] = useState(false);
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
    /*
      На мобилке шапка App.jsx = 56px (pt-14), на десктопе pt-0.
      Высота чат-страницы = весь viewport минус шапка.
    */
    <div className="flex h-[calc(100vh-56px)] lg:h-screen bg-slate-50">

      {/* Область сообщений */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedRoom ? (
          <ChatWindow roomId={selectedRoom} chatData={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <FiMessageSquare size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600">Выберите чат</p>
              <p className="text-sm mt-1">Выберите чат из списка справа</p>
            </div>
          </div>
        )}
      </div>

      {/* Список чатов — десктоп, sticky справа */}
      <div className="hidden md:flex flex-col w-72 border-l border-slate-200 bg-white overflow-hidden flex-shrink-0">
        <ChatList
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          loading={loading}
        />
      </div>

      {/* Мобилка: кнопка открыть список чатов */}
      {!mobileChatListOpen && (
        <button
          onClick={() => setMobileChatListOpen(true)}
          className="md:hidden fixed bottom-6 right-4 z-20 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2"
        >
          <FiMessageSquare size={16} />
          Чаты
        </button>
      )}

      {/* Мобилка: overlay со списком чатов */}
      {mobileChatListOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={() => setMobileChatListOpen(false)}
          />
          <div className="md:hidden fixed top-14 right-0 bottom-0 w-72 z-30 bg-white flex flex-col shadow-xl">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="font-semibold text-slate-800 text-sm">Чаты</span>
              <button
                onClick={() => setMobileChatListOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChatList
                selectedRoom={selectedRoom}
                onSelectRoom={handleSelectRoom}
                loading={loading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;
