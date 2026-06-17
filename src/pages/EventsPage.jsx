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

  const eventStyles = {
    'Тест':       { card: 'border-l-4 border-yellow-400 bg-white', badge: 'bg-yellow-100 text-yellow-700' },
    'Контрольная':{ card: 'border-l-4 border-orange-400 bg-white', badge: 'bg-orange-100 text-orange-700' },
    'Экзамен':    { card: 'border-l-4 border-red-400 bg-white',    badge: 'bg-red-100 text-red-700' },
    'Другое':     { card: 'border-l-4 border-gray-300 bg-white',   badge: 'bg-gray-100 text-gray-600' },
  };
  const eventTypes = ['Тест', 'Контрольная', 'Экзамен', 'Другое'];
  const reminderOptions = [
    { value: -1, label: 'Отключить' },
    { value: 15, label: '15 минут' },
    { value: 30, label: '30 минут' },
    { value: 60, label: '1 час' },
    { value: 1440, label: '1 день' },
  ];
  const groups = ['ИБ-11БО', 'ИБ-21БО', 'ИБ-31БО', 'ИБ-41БО', 'КБ-11СО', 'КБ-21СО', 'КБ-31СО', 'КБ-41СО', 'КБ-51СО', 'МКН-11БО', 'МКН-21БО', 'МКН-31БО', 'МКН-41БО', 'ПМИ-11БО', 'ПМИ-12БО', 'ПМИ-13БО', 'ПМИ-21БО', 'ПМИ-22БО', 'ПМИ-23БО', 'ПМИ-31БО', 'ПМИ-32БО', 'ПМИ-33БО', 'ПМИ-41БО', 'ПМИ-42БО', 'ПМИ-43БО', 'ПМИ-11МО', 'МКН-11МО', 'ИБМ-11МО'];

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
        group_number: editFormData.group_number,
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
        group_number: addFormData.group_number,
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
      'https://timeofthestars.online/users/me/notification-settings',
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
    <div className="p-4 sm:p-6 max-w-xl mx-auto relative">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">События</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setReminderModalOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Настройки напоминаний"
          >
            <FiSettings size={20} />
          </button>
          {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'group_leader') && (
            <button
              onClick={handleEditToggle}
              className={`p-2 rounded-lg transition ${isEditing ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              {isEditing ? <FiX size={20} /> : <FiEdit size={20} />}
            </button>
          )}
        </div>
      </div>
      <div className="mb-5">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={user?.role === 'student' || user?.role === 'group_leader'}
        >
          <option value={user?.group_number || ''}>{user?.group_number || 'Выберите группу'}</option>
          {(user?.role === 'admin' || user?.role === 'teacher') && groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-lg shadow-sm">Нет актуальных событий</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const style = eventStyles[event.event_type] || eventStyles['Другое'];
            return (
              <div
                key={event.id}
                className={`rounded-xl shadow-sm p-4 ${style.card}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                        {event.event_type}
                      </span>
                      <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FiCalendar size={12} />
                      {new Date(event.start_datetime).toLocaleString('ru-RU', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  {(user?.role === 'admin' || user?.role === 'teacher' || (user?.role === 'group_leader' && event.group_number === user.group_number)) && isEditing && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <FiTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isEditing && (
        <button
          onClick={handleAddEvent}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <FiPlus size={24} />
        </button>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Редактировать событие</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Тип события</label>
                <select
                  name="event_type"
                  value={editFormData.event_type}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время</label>
                <input
                  type="time"
                  name="time"
                  value={editFormData.time}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Группа</label>
                <select
                  name="group_number"
                  value={editFormData.group_number}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              {editFormError && (
                <p className="text-red-500 text-sm">{editFormError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Добавить событие</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  name="title"
                  value={addFormData.title}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Тип события</label>
                <select
                  name="event_type"
                  value={addFormData.event_type}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
                <input
                  type="date"
                  name="date"
                  value={addFormData.date}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время</label>
                <input
                  type="time"
                  name="time"
                  value={addFormData.time}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Группа</label>
                <select
                  name="group_number"
                  value={addFormData.group_number}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  name="description"
                  value={addFormData.description || ''}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              {addFormError && (
                <p className="text-red-500 text-sm">{addFormError}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Подтверждение удаления</h3>
              <button
                onClick={cancelDelete}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="mb-4">Вы уверены, что хотите удалить событие "<strong>{eventToDelete?.title}</strong>"?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
              >
                Нет
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Settings Modal */}
      {reminderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Настройки напоминаний</h3>
              <button
                onClick={() => setReminderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время напоминания</label>
                <select
                  value={reminderSetting}
                  onChange={(e) => setReminderSetting(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {reminderOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setReminderModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={handleReminderSubmit}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
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