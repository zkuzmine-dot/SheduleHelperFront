import React, { useEffect, useState } from 'react';
import { BsChat, BsPeople, BsPerson } from 'react-icons/bs';
import { chatAPI } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';

const chatTypeColors = {
  group:    'bg-blue-100 text-blue-600',
  teachers: 'bg-purple-100 text-purple-600',
  private:  'bg-slate-100 text-slate-600',
};

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
    if (user) fetchChats();
  }, [user]);

  const getChatIcon = (chat) => {
    if (chat.type === 'group')    return <BsChat size={16} />;
    if (chat.type === 'teachers') return <BsPeople size={16} />;
    return <BsPerson size={16} />;
  };

  const getChatDisplayName = (chat) => {
    if (chat.type === 'teachers') return 'Чат преподавателей';
    return chat.name;
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 text-sm p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Чаты</p>
      </div>
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm p-4 text-center">
          {loading ? 'Загрузка...' : 'Нет доступных чатов'}
        </div>
      ) : (
        <ul className="p-2 space-y-0.5 overflow-y-auto flex-1">
          {chats.map((chat) => (
            <li key={chat.room_id}>
              <button
                onClick={() => onSelectRoom(chat.room_id, chat)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                  selectedRoom === chat.room_id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  chatTypeColors[chat.type] || chatTypeColors.private
                }`}>
                  {getChatIcon(chat)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {getChatDisplayName(chat)}
                  </p>
                  {chat.type === 'private' && (
                    <p className="text-xs text-slate-400">Личный чат</p>
                  )}
                  {chat.type === 'group' && (
                    <p className="text-xs text-slate-400">Группа</p>
                  )}
                </div>
                {selectedRoom === chat.room_id && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
