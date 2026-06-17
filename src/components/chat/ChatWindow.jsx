import React, { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import OnlineUsers from './OnlineUsers';
import { chatAPI, createWebSocketChat } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import { abbreviateName } from '../../utils/formatName';

const ChatWindow = ({ roomId, chatData, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsError, setWsError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wsRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isFirstLoadRef = useRef(true);

  const { user } = useAuth();

  // Загрузка истории сообщений
  useEffect(() => {
    const loadHistory = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await chatAPI.getChatHistory(roomId, 50, 0);
        setMessages(response.data.messages);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Не удалось загрузить историю чата');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
    setOnlineUsers([]);

    isInitializedRef.current = false;
    isFirstLoadRef.current = true;
  }, [roomId]);

  // WebSocket подключение (безопасное для StrictMode)
  useEffect(() => {
    if (!roomId || !user) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Ошибка: нет токена доступа');
      return;
    }

    // Проверка: уже ли инициализировали WebSocket для этой комнаты
    if (isInitializedRef.current) {
      console.log('WebSocket already initialized for room:', roomId);
      return;
    }

    isInitializedRef.current = true;

    try {
      const ws = createWebSocketChat(roomId, accessToken);

      ws.onopen = () => {
        console.log('WebSocket connected to room:', roomId);
        setWsError(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === 'online_users') {
          setOnlineUsers(data.users);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setWsError(true);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected from:', roomId);
      };

      wsRef.current = ws;

    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setWsError(true);
      isInitializedRef.current = false;
    }

    // Cleanup: закрываем WebSocket
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      isInitializedRef.current = false;
    };
  }, [roomId, user]);

  // Автоскролл вниз
  useEffect(() => {
    if (loading || messages.length === 0) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    if (isFirstLoadRef.current) {
      // При первой загрузке — мгновенно, без анимации
      container.scrollTop = container.scrollHeight;
      isFirstLoadRef.current = false;
    } else {
      // При новом сообщении — плавно
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = (content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
      onMessageSent?.();
    } else {
      setWsError(true);
    }
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        Выберите чат для начала переписки
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Заголовок */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 text-sm">
          {chatData?.name
            ? (chatData.type === 'private' ? abbreviateName(chatData.name) : chatData.name)
            : roomId
                .replace('group:', '')
                .replace('private:', '')
                .replace(/_/g, ' — ')
                .replace('teachers', 'Чат преподавателей')}
        </h2>
        {wsError && (
          <span className="text-xs text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
            Нет соединения
          </span>
        )}
      </div>

      {/* Онлайн-пользователи */}
      <div className="flex-shrink-0">
        <OnlineUsers users={onlineUsers} />
      </div>

      {/* Сообщения */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Загрузка сообщений...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <div>
              <p className="font-medium mb-2">Нет сообщений</p>
              <p className="text-sm">Будьте первым, кто напишет сообщение!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Ввод сообщения */}
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} disabled={wsError} />
      </div>
    </div>
  );
};

export default ChatWindow;
