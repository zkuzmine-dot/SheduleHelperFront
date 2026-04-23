import React, { useState, useEffect } from 'react';
import { ChatList, ChatWindow } from '../components/chat';
import { useAuth } from '../hooks/useAuth';

function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !selectedRoom) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, selectedRoom]);

  const handleSelectRoom = (room, chatData) => {
    setSelectedRoom(room);
    setSelectedChat(chatData);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-100 relative lg:ml-64">
      {/* Основное содержимое чатов */}
      <div className="flex-1 flex flex-col h-full">
        {selectedRoom ? (
          <ChatWindow roomId={selectedRoom} chatData={selectedChat} />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="font-medium mb-2">Выберите чат</p>
              <p className="text-sm">Выберите чат из списка справа</p>
            </div>
          </div>
        )}
      </div>

      {/* Сайдбар чатов - справа на md+, overlay справа на мобиле */}
      <div className={`hidden md:flex md:w-80 h-full border-l border-gray-200 bg-white flex-col`}>
        <ChatList
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          loading={loading}
        />
      </div>

      {/* Мобильная кнопка открытия чатов - справа сверху */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 right-4 z-20 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
      >
        Все чаты
      </button>

      {/* Мобильный overlay сайдбар - открывается справа */}
      {sidebarOpen && (
        <div className="md:hidden fixed top-16 right-0 bottom-0 w-80 z-20 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
            <span className="font-medium">Чаты</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatList
              selectedRoom={selectedRoom}
              onSelectRoom={handleSelectRoom}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
