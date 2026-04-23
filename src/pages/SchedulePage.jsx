import { useState, useEffect } from 'react';
import { schedulesAPI } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';
import { FiEdit, FiPlus, FiTrash, FiX } from 'react-icons/fi';

function SchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [group, setGroup] = useState(user?.group_number || 'ИБ-11БО');
  const [week, setWeek] = useState('current');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const groups = ['ИБ-11БО','ИБ-21БО','ИБ-31БО','ИБ-41БО','КБ-11СО','КБ-21СО','КБ-31СО','КБ-41СО','КБ-51СО','МКН-11БО','MKH-21БО','MKH-31БО','MKH-41БО','ПМИ-11БО','ПМИ-12БО','ПМИ-13БО','ПМИ-21БО','ПМИ-22БО','ПМИ-23БО','ПМИ-31БО','ПМИ-32БО','ПМИ-33БО','ПМИ-41БО','ПМИ-42БО','ПМИ-43БО','ПМИ-11МО','МКН-11МО','ИБМ-11МО'];
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const weekTypes = ['denominator', 'numerator', 'both'];
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [editFormError, setEditFormError] = useState('');
  const [addFormError, setAddFormError] = useState('');
  const [editFormData, setEditFormData] = useState({
    subject: '',
    start_time: '',
    end_time: '',
    classroom: '',
    teacher_name: '',
    subgroup: '',
    week_type: 'denominator',
  });
  const [addFormData, setAddFormData] = useState({
    subject: '',
    start_time: '',
    end_time: '',
    classroom: '',
    teacher_name: '',
    subgroup: '',
    day_of_week: '1',
    week_type: 'denominator',
  });

  useEffect(() => {
    fetchSchedules();
  }, [group, week]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await schedulesAPI.getAll(group, week);
      setSchedules(response.data);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      setError('Не удалось загрузить расписание');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleAddSchedule = () => {
    setAddFormData({
      subject: '',
      start_time: '',
      end_time: '',
      classroom: '',
      teacher_name: '',
      subgroup: '',
      day_of_week: '1',
      week_type: 'denominator',
    });
    setAddFormError('');
    setAddModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setEditFormData({
      subject: schedule.subject || '',
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      classroom: schedule.classroom || '',
      teacher_name: schedule.teacher_name || '',
      subgroup: schedule.subgroup || '',
      week_type: schedule.week_type || 'denominator',
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
    if (!editFormData.subject.trim()) return 'Название предмета обязательно';
    if (!editFormData.start_time) return 'Время начала обязательно';
    if (!editFormData.end_time) return 'Время окончания обязательно';
    const startTime = new Date(`1970-01-01T${editFormData.start_time}`);
    const endTime = new Date(`1970-01-01T${editFormData.end_time}`);
    if (startTime >= endTime) return 'Время окончания должно быть позже времени начала';
    if (editFormData.subgroup && isNaN(parseInt(editFormData.subgroup))) return 'Подгруппа должна быть числом';
    return '';
  };

  const validateAddForm = () => {
    if (!addFormData.subject.trim()) return 'Название предмета обязательно';
    if (!addFormData.start_time) return 'Время начала обязательно';
    if (!addFormData.end_time) return 'Время окончания обязательно';
    const startTime = new Date(`1970-01-01T${addFormData.start_time}`);
    const endTime = new Date(`1970-01-01T${addFormData.end_time}`);
    if (startTime >= endTime) return 'Время окончания должно быть позже времени начала';
    if (addFormData.subgroup && isNaN(parseInt(addFormData.subgroup))) return 'Подгруппа должна быть числом';
    if (isNaN(parseInt(addFormData.day_of_week)) || parseInt(addFormData.day_of_week) < 1 || parseInt(addFormData.day_of_week) > 7)
      return 'День недели должен быть от 1 до 7';
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
      const updatedSchedule = {
        group_number: selectedSchedule.group_number,
        day_of_week: selectedSchedule.day_of_week,
        start_time: editFormData.start_time,
        end_time: editFormData.end_time,
        lesson_type: selectedSchedule.lesson_type,
        subject: editFormData.subject,
        classroom: editFormData.classroom || null,
        teacher_name: editFormData.teacher_name || null,
        subgroup: editFormData.subgroup ? parseInt(editFormData.subgroup) : null,
        week_type: editFormData.week_type,
      };
      await schedulesAPI.update(selectedSchedule.id, updatedSchedule);
      setEditModalOpen(false);
      setEditFormError('');
      fetchSchedules();
    } catch (err) {
      console.error('Ошибка обновления расписания:', err);
      setEditFormError('Не удалось обновить расписание');
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
      const newSchedule = {
        group_number: group,
        day_of_week: parseInt(addFormData.day_of_week),
        start_time: addFormData.start_time,
        end_time: addFormData.end_time,
        lesson_type: 'lecture',
        subject: addFormData.subject,
        classroom: addFormData.classroom || null,
        teacher_name: addFormData.teacher_name || null,
        subgroup: addFormData.subgroup ? parseInt(addFormData.subgroup) : null,
        week_type: addFormData.week_type,
      };
      await schedulesAPI.create(newSchedule);
      setAddModalOpen(false);
      setAddFormError('');
      fetchSchedules();
    } catch (err) {
      console.error('Ошибка добавления расписания:', err);
      setAddFormError('Не удалось добавить расписание');
    }
  };

  const handleDeleteSchedule = (scheduleId) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    setScheduleToDelete({ id: scheduleId, subject: schedule.subject });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        await schedulesAPI.delete(scheduleToDelete.id);
        fetchSchedules();
      } catch (err) {
        console.error('Ошибка удаления расписания:', err);
        setError('Не удалось удалить расписание');
      } finally {
        setDeleteModalOpen(false);
        setScheduleToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setScheduleToDelete(null);
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week - 1]) {
      acc[schedule.day_of_week - 1] = [];
    }
    acc[schedule.day_of_week - 1].push(schedule);
    acc[schedule.day_of_week - 1].sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a.start_time}`);
      const timeB = new Date(`1970-01-01T${b.start_time}`);
      return timeA - timeB;
    });
    return acc;
  }, Array(7).fill(null));

  const canEdit = user?.role === 'admin' || user?.role === 'teacher' || (user?.role === 'group_leader' && user?.group_number === group);

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl font-bold text-blue-600">Расписание</h2>
        {canEdit && (
          <button
            onClick={handleEditToggle}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            {isEditing ? <FiX size={20} /> : <FiEdit size={20} />}
          </button>
        )}
      </div>
      <div className="flex flex-col space-y-2 mb-4">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="current">Текущая неделя</option>
          <option value="next">Следующая неделя</option>
        </select>
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Загрузка...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : schedules.length === 0 ? (
        <p className="text-center text-gray-500">Нет расписания для выбранной группы и недели</p>
      ) : (
        <div className="space-y-4">
          {days.map((day, index) => (
            <div
              key={day}
              className={`p-4 rounded-lg ${
                index === currentDayIndex ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white'
              } shadow-md`}
            >
              <h3 className="text-lg font-semibold text-gray-800">{day}</h3>
              {groupedSchedules[index]?.length > 0 ? (
                groupedSchedules[index].map((schedule) => (
                  <div
                    key={schedule.id}
                    className="mt-2 p-2 border-l-4 border-blue-500 bg-gray-50 relative"
                  >
                    <p className="font-medium text-gray-800">{schedule.subject}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.start_time} - {schedule.end_time}
                    </p>
                    {schedule.classroom && (
                      <p className="text-sm text-gray-600">Ауд: {schedule.classroom}</p>
                    )}
                    {schedule.teacher_name && (
                      <p className="text-sm text-gray-600">{schedule.teacher_name}</p>
                    )}
                    {schedule.subgroup && (
                      <p className="text-sm text-gray-600">Подгруппа: {schedule.subgroup}</p>
                    )}
                    {isEditing && canEdit && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 mt-2">Нет занятий</p>
              )}
            </div>
          ))}
        </div>
      )}
      {isEditing && canEdit && (
        <button
          onClick={handleAddSchedule}
          className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition z-40"
        >
          <FiPlus size={24} />
        </button>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Редактировать расписание</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Предмет</label>
                <input
                  type="text"
                  name="subject"
                  value={editFormData.subject}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время начала</label>
                <input
                  type="time"
                  name="start_time"
                  value={editFormData.start_time}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время окончания</label>
                <input
                  type="time"
                  name="end_time"
                  value={editFormData.end_time}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Аудитория</label>
                <input
                  type="text"
                  name="classroom"
                  value={editFormData.classroom}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Преподаватель</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={editFormData.teacher_name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Подгруппа</label>
                <input
                  type="number"
                  name="subgroup"
                  value={editFormData.subgroup}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип недели</label>
                <select
                  name="week_type"
                  value={editFormData.week_type}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {weekTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'denominator' ? 'Знаменатель' : type === 'numerator' ? 'Числитель' : 'Обе недели'}
                    </option>
                  ))}
                </select>
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
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Добавить расписание</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Предмет</label>
                <input
                  type="text"
                  name="subject"
                  value={addFormData.subject}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время начала</label>
                <input
                  type="time"
                  name="start_time"
                  value={addFormData.start_time}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Время окончания</label>
                <input
                  type="time"
                  name="end_time"
                  value={addFormData.end_time}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Аудитория</label>
                <input
                  type="text"
                  name="classroom"
                  value={addFormData.classroom}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Преподаватель</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={addFormData.teacher_name}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Подгруппа</label>
                <input
                  type="number"
                  name="subgroup"
                  value={addFormData.subgroup}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">День недели</label>
                <select
                  name="day_of_week"
                  value={addFormData.day_of_week}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {days[num - 1]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип недели</label>
                <select
                  name="week_type"
                  value={addFormData.week_type}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {weekTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'denominator' ? 'Знаменатель' : type === 'numerator' ? 'Числитель' : 'Обе недели'}
                    </option>
                  ))}
                </select>
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
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Удалить расписание?</h3>
            <p className="text-gray-600 mb-4">Вы уверены, что хотите удалить этот предмет?</p>
            <p className="font-medium text-gray-800 mb-6">{scheduleToDelete?.subject}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;