import React, { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import OnlineUsers from './OnlineUsers';
import { chatAPI, createWebSocketChat } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';

const ChatWindow = ({ roomId, chatData }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsError, setWsError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const isInitializedRef = useRef(false);
  const pollIntervalRef = useRef(null);
  
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

        // Загружаем список онлайн-пользователей
        await fetchOnlineUsers(roomId);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Не удалось загрузить историю чата');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
    
    // Сбрасываем флаг инициализации при смене комнаты
    isInitializedRef.current = false;

    return () => {
      // Очищаем интервал при смене комнаты
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [roomId]);

  // Функция для загрузки онлайн-пользователей
  const fetchOnlineUsers = async (room) => {
    try {
      const onlineResponse = await chatAPI.getOnlineUsers(room);
      setOnlineUsers(onlineResponse.data.users);
    } catch (err) {
      console.error('Failed to load online users:', err);
    }
  };

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

        // Получаем только сообщения типа 'message'
        if (data.type === 'message') {
          setMessages((prev) => [...prev, data]);
        }
        // Игнорируем 'user_joined', 'user_left' - используем только GET /chat/online/{room_id}
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

    // Cleanup: закрываем WebSocket и очищаем интервал полинга
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      isInitializedRef.current = false;
    };
  }, [roomId, user]);

  // Периодическое обновление онлайн-пользователей (каждые 5 секунд)
  useEffect(() => {
    if (!roomId) return;

    // Первый запрос сразу
    fetchOnlineUsers(roomId);

    // Затем каждые 5 секунд
    pollIntervalRef.current = setInterval(() => {
      fetchOnlineUsers(roomId);
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [roomId]);

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
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
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {chatData?.name || roomId
            .replace('group:', '')
            .replace('private:', '')
            .replace(/_/g, ' - ')
            .replace('teachers', 'Чат преподавателей')}
        </h2>
        {wsError && (
          <p className="text-sm text-red-500 mt-1">
            ⚠️ Ошибка подключения. Попробуйте обновить страницу.
          </p>
        )}
      </div>

      {/* Онлайн-пользователи */}
      <div className="flex-shrink-0">
        <OnlineUsers users={onlineUsers} />
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
