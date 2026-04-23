import { useState, useEffect } from 'react';
import { eventsAPI } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';
import { FiEdit, FiPlus, FiTrash, FiX, FiCalendar, FiSettings } from 'react-icons/fi';
import axios from 'axios';
function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [group, setGroup] = useState(user?.group_number || 'ИВТ-21-1');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    event_type: 'Тест',
    date: '',
    time: '',
    group_number: '',
    description: '',
  });
  const [addFormData, setAddFormData] = useState({
    title: '',
    event_type: 'Тест',
    date: '',
    time: '',
    group_number: '',
    description: '',
  });
  const [reminderSetting, setReminderSetting] = useState(-1);
  const [editFormError, setEditFormError] = useState('');
  const [addFormError, setAddFormError] = useState('');

  const eventColors = {
    'Тест': 'bg-yellow-200',
    'Контрольная': 'bg-orange-200',
    'Экзамен': 'bg-red-200',
    'Другое': 'bg-gray-200',
  };
  const eventTypes = ['Тест', 'Контрольная', 'Экзамен', 'Другое'];
  const reminderOptions = [
    { value: -1, label: 'Отключить' },
    { value: 15, label: '15 минут' },
    { value: 30, label: '30 минут' },
    { value: 60, label: '1 час' },
    { value: 1440, label: '1 день' },
  ];
  const groups = ['ИБ-11БО', 'ИБ-21БО', 'ИБ-31БО', 'ИБ-41БО', 'КБ-11СО', 'КБ-21СО', 'КБ-31СО', 'КБ-41СО', 'КБ-51СО', 'МКН-11БО', 'MKH-21БО', 'MKH-31БО', 'MKH-41БО', 'ПМИ-11БО', 'ПМИ-12БО', 'ПМИ-13БО', 'ПМИ-21БО', 'ПМИ-22БО', 'ПМИ-23БО', 'ПМИ-31БО', 'ПМИ-32БО', 'ПМИ-33БО', 'ПМИ-41БО', 'ПМИ-42БО', 'ПМИ-43БО', 'ПМИ-11МО', 'МКН-11МО', 'ИБМ-11МО'];

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  useEffect(() => {
    if (group) {
      fetchEvents();
    }
  }, [group]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await eventsAPI.getAll(group);
      const sortedEvents = response.data.sort((a, b) => {
        return new Date(a.start_datetime) - new Date(b.start_datetime);
      });
      setEvents(sortedEvents);
    } catch (err) {
      console.error('Ошибка загрузки событий:', err);
      setError('Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleAddEvent = () => {
    setAddFormData({
      title: '',
      event_type: 'Тест',
      date: '',
      time: '',
      group_number: group || (user?.role === 'admin' || user?.role === 'teacher' ? groups[0] : user?.group_number || ''),
      description: '',
    });
    setAddFormError('');
    setAddModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    const dateTime = new Date(event.start_datetime);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().slice(0, 5);
    setEditFormData({
      title: event.title,
      event_type: event.event_type,
      date,
      time,
      group_number: event.group_number,
      description: event.description,
    });
    setEditFormError('');
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEditForm = () => {
    if (!editFormData.title.trim()) return 'Название события обязательно';
    if (!editFormData.date) return 'Дата обязательна';
    if (!editFormData.time) return 'Время обязательно';
    return '';
  };

  const validateAddForm = () => {
    if (!addFormData.title.trim()) return 'Название события обязательно';
    if (!addFormData.date) return 'Дата обязательна';
    if (!addFormData.time) return 'Время обязательно';
    return '';
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateEditForm();
    if (validationError) {
      setEditFormError(validationError);
      return;
    }

    try {
      const start_datetime = `${editFormData.date} ${editFormData.time}`;
      await eventsAPI.update(selectedEvent.id, {
        title: editFormData.title,
        event_type: editFormData.event_type,
        start_datetime,
        group_number: selectedEvent.group_number,
        description: editFormData.description,
      });
      setEditModalOpen(false);
      setEditFormError('');
      fetchEvents();
    } catch (err) {
      console.error('Ошибка обновления события:', err);
      setEditFormError('Не удалось обновить событие');
    }
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateAddForm();
    if (validationError) {
      setAddFormError(validationError);
      return;
    }

    try {
      const start_datetime = `${addFormData.date} ${addFormData.time}`;
      await eventsAPI.create({
        title: addFormData.title,
        event_type: addFormData.event_type,
        start_datetime,
        group_number: group,
        description: addFormData.description,
      });
      setAddModalOpen(false);
      setAddFormError('');
      fetchEvents();
    } catch (err) {
      console.error('Ошибка добавления события:', err);
      setAddFormError('Не удалось добавить событие');
    }
  };

  const handleDeleteEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setEventToDelete({ id: eventId, title: event.title });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await eventsAPI.delete(eventToDelete.id);
        fetchEvents();
      } catch (err) {
        console.error('Ошибка удаления события:', err);
        setError('Не удалось удалить событие');
      } finally {
        setDeleteModalOpen(false);
        setEventToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleReminderSubmit = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');   // ← важно: access_token

    if (!accessToken) {
      setError('Сессия истекла. Пожалуйста, войдите заново.');
      return;
    }

    await axios.put(
      'http://localhost:8000/users/me/notification-settings',
      {
        notification_settings: JSON.stringify({ 
          event_reminder: Number(reminderSetting) 
        })
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    setReminderModalOpen(false);
    showNotification('Настройки напоминаний успешно обновлены');
    
  } catch (err) {
    console.error('Полная ошибка:', err);

    if (err.response?.status === 401) {
      setError('Сессия истекла. Пожалуйста, войдите заново.');
      // Можно автоматически вызвать logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } else {
      const errorMsg = err.response?.data?.detail || err.message || 'Неизвестная ошибка';
      setError(`Не удалось обновить настройки: ${errorMsg}`);
    }
  }
};

  return (
    <div className="p-4 max-w-md mx-auto relative">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          {notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl font-bold text-blue-600">События</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setReminderModalOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FiSettings size={20} />
          </button>
          {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'group_leader') && (
            <button
              onClick={handleEditToggle}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isEditing ? <FiX size={20} /> : <FiEdit size={20} />}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col space-y-2 mb-4">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={user?.role === 'student' || user?.role === 'group_leader'}
        >
          <option value={user?.group_number || ''}>{user?.group_number || 'Выберите группу'}</option>
          {(user?.role === 'admin' || user?.role === 'teacher') && groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">Нет актуальных событий</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg shadow-md ${eventColors[event.event_type] || 'bg-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.start_datetime).toLocaleString('ru-RU', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
                {(user?.role === 'admin' || user?.role === 'teacher' || (user?.role === 'group_leader' && event.group_number === user.group_number)) && isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600"
                    >
                      <FiTrash size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {isEditing && (
        <button
          onClick={handleAddEvent}
          className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg"
        >
          <FiPlus size={24} />
        </button>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Редактировать событие</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип события</label>
                <select
                  name="event_type"
                  value={editFormData.event_type}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Дата</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время</label>
                <input
                  type="time"
                  name="time"
                  value={editFormData.time}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Группа</label>
                <select
                  name="group_number"
                  value={editFormData.group_number}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {(user?.role === 'admin' || user?.role === 'teacher') ? (
                    groups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  ) : (
                    <option key={user?.group_number} value={user?.group_number}>{user?.group_number}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {editFormError && (
                <p className="text-red-500 text-sm">{editFormError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Добавить событие</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  name="title"
                  value={addFormData.title}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип события</label>
                <select
                  name="event_type"
                  value={addFormData.event_type}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Дата</label>
                <input
                  type="date"
                  name="date"
                  value={addFormData.date}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время</label>
                <input
                  type="time"
                  name="time"
                  value={addFormData.time}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Группа</label>
                <select
                  name="group_number"
                  value={addFormData.group_number}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {(user?.role === 'admin' || user?.role === 'teacher') ? (
                    groups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  ) : (
                    <option key={user?.group_number} value={user?.group_number}>{user?.group_number}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  name="description"
                  value={addFormData.description || ''}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {addFormError && (
                <p className="text-red-500 text-sm">{addFormError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Подтверждение удаления</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="mb-4">Вы уверены, что хотите удалить событие "<strong>{eventToDelete?.title}</strong>"?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Нет
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Settings Modal */}
      {reminderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Настройки напоминаний</h3>
              <button
                onClick={() => setReminderModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Время напоминания</label>
                <select
                  value={reminderSetting}
                  onChange={(e) => setReminderSetting(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {reminderOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setReminderModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Отмена
                </button>
                <button
                  onClick={handleReminderSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;