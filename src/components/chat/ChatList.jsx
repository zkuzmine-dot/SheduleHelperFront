import React, { useEffect, useState } from 'react';
import { BsChat, BsPeople, BsPerson } from 'react-icons/bs';
import { FiSearch, FiArrowLeft, FiX } from 'react-icons/fi';
import { chatAPI } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { abbreviateName } from '../../utils/formatName';

const chatTypeColors = {
  group:    'bg-blue-100 text-blue-600',
  teachers: 'bg-purple-100 text-purple-600',
  private:  'bg-slate-100 text-slate-600',
};

const ChatList = ({ selectedRoom, onSelectRoom, loading = false, refreshKey = 0, onClose = null }) => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

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

    fetchChats();

    // Поллинг — чтобы видеть новые входящие чаты без открытия конкретной комнаты
    const interval = setInterval(fetchChats, 12000);
    return () => clearInterval(interval);
  }, [user, refreshKey]);

  const openSearch = async () => {
    setSearchOpen(true);
    if (contacts.length === 0) {
      setContactsLoading(true);
      setContactsError(null);
      try {
        const response = await chatAPI.getChatContacts();
        setContacts(response.data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
        setContactsError('Не удалось загрузить список');
      } finally {
        setContactsLoading(false);
      }
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectContact = (contact) => {
    onSelectRoom(contact.room_id, { name: contact.name, type: 'private' });
    closeSearch();
  };

  const getChatIcon = (chat) => {
    if (chat.type === 'group')    return <BsChat size={16} />;
    if (chat.type === 'teachers') return <BsPeople size={16} />;
    return <BsPerson size={16} />;
  };

  const getChatDisplayName = (chat) => {
    if (chat.type === 'teachers') return 'Чат преподавателей';
    if (chat.type === 'private') return abbreviateName(chat.name);
    return chat.name;
  };

  const filteredContacts = searchQuery.trim()
    ? contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (c.subtitle || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : contacts;

  if (searchOpen) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-white">
        <div className="px-3 py-3 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={closeSearch}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
            aria-label="Назад"
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={15}
            />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Найти собеседника..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
              aria-label="Закрыть"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {contactsLoading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Загрузка...</div>
          ) : contactsError ? (
            <div className="flex items-center justify-center h-32 text-red-400 text-sm text-center p-4">
              {contactsError}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm text-center p-4">
              Никого не найдено
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.user_id}
                onClick={() => handleSelectContact(contact)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-700 truncate">{abbreviateName(contact.name)}</p>
                  {contact.subtitle && (
                    <p className="text-xs text-slate-400 truncate">{contact.subtitle}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 text-sm p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Чаты</p>
        <div className="flex items-center gap-1">
          <button
            onClick={openSearch}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Найти собеседника"
          >
            <FiSearch size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              aria-label="Закрыть"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm p-4 text-center">
          {loading ? 'Загрузка...' : 'Нет активных чатов'}
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
