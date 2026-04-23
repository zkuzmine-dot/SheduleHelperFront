import React, { useEffect, useState } from 'react';
import { BsChat, BsPeople, BsPerson } from 'react-icons/bs';
import { chatAPI } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';

const ChatList = ({ selectedRoom, onSelectRoom, loading = false }) => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setError(null);
        const response = await chatAPI.getMyChats();
        setChats(response.data);
      } catch (err) {
        console.error('Failed to load chats:', err);
        setError('Не удалось загрузить список чатов');
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  const getChatIcon = (chat) => {
    if (chat.type === 'group') return <BsChat size={18} />;
    if (chat.type === 'teachers') return <BsPeople size={18} />;
    return <BsPerson size={18} />;
  };

  const getChatDisplayName = (chat) => {
    if (chat.type === 'group') return chat.name;
    if (chat.type === 'teachers') return 'Чат преподавателей';
    return chat.name;
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 text-sm p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm p-4 text-center">
          {loading ? 'Загрузка чатов...' : 'Нет доступных чатов'}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {chats.map((chat) => (
            <li key={chat.room_id}>
              <button
                onClick={() => onSelectRoom(chat.room_id, chat)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 ${
                  selectedRoom === chat.room_id
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className="text-gray-600">
                  {getChatIcon(chat)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {getChatDisplayName(chat)}
                  </p>
                  {chat.type === 'private' && chat.teacher_id && (
                    <p className="text-xs text-gray-500">Частный чат</p>
                  )}
                </div>
                {/* Можно добавить счетчик непрочитанных сообщений позже */}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
