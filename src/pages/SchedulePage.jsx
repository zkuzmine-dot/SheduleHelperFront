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
  const groups = ['ИБ-11БО','ИБ-21БО','ИБ-31БО','ИБ-41БО','КБ-11СО','КБ-21СО','КБ-31СО','КБ-41СО','КБ-51СО','МКН-11БО','МКН-21БО','МКН-31БО','МКН-41БО','ПМИ-11БО','ПМИ-12БО','ПМИ-13БО','ПМИ-21БО','ПМИ-22БО','ПМИ-23БО','ПМИ-31БО','ПМИ-32БО','ПМИ-33БО','ПМИ-41БО','ПМИ-42БО','ПМИ-43БО','ПМИ-11МО','МКН-11МО','ИБМ-11МО'];
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const weekTypes = ['denominator', 'numerator', 'both'];
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [deleteDayModalOpen, setDeleteDayModalOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState(null);
  const [deleteDayStep, setDeleteDayStep] = useState(1);
  const [deletingDay, setDeletingDay] = useState(false);
  const [deleteDayError, setDeleteDayError] = useState('');
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

  const handleDeleteDay = (index) => {
    const lessons = groupedSchedules[index] || [];
    if (lessons.length === 0) return;
    setDayToDelete({ index, day: days[index], lessons });
    setDeleteDayStep(1);
    setDeleteDayError('');
    setDeleteDayModalOpen(true);
  };

  const confirmDeleteDay = async () => {
    if (!dayToDelete) return;
    setDeletingDay(true);
    setDeleteDayError('');
    try {
      await Promise.all(dayToDelete.lessons.map((l) => schedulesAPI.delete(l.id)));
      setDeleteDayModalOpen(false);
      setDayToDelete(null);
      setDeleteDayStep(1);
      fetchSchedules();
    } catch (err) {
      console.error('Ошибка удаления дня:', err);
      setDeleteDayError('Не удалось удалить все занятия дня');
    } finally {
      setDeletingDay(false);
    }
  };

  const cancelDeleteDay = () => {
    setDeleteDayModalOpen(false);
    setDayToDelete(null);
    setDeleteDayStep(1);
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

  const weekTypeLabel = {
    denominator: { text: 'Знам.', cls: 'bg-purple-100 text-purple-700' },
    numerator: { text: 'Числ.', cls: 'bg-green-100 text-green-700' },
    both: { text: 'Обе', cls: 'bg-gray-100 text-gray-600' },
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Расписание</h2>
        {canEdit && (
          <button
            onClick={handleEditToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              isEditing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? <><FiX size={16} /> Завершить</> : <><FiEdit size={16} /> Редактировать</>}
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="current">Текущая неделя</option>
          <option value="next">Следующая неделя</option>
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-lg shadow-sm">Нет расписания для выбранной группы и недели</div>
      ) : (
        <div className="space-y-3">
          {days.map((day, index) => (
            <div
              key={day}
              className={`rounded-xl shadow-sm overflow-hidden ${
                index === currentDayIndex
                  ? 'ring-2 ring-blue-500'
                  : 'bg-white'
              }`}
            >
              <div className={`px-4 py-2.5 flex items-center gap-2 ${
                index === currentDayIndex ? 'bg-blue-600 text-white' : 'bg-gray-50 border-b border-gray-100'
              }`}>
                <h3 className="font-semibold text-sm uppercase tracking-wide">{day}</h3>
                {index === currentDayIndex && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">Сегодня</span>}
                {isEditing && canEdit && groupedSchedules[index]?.length > 0 && (
                  <button
                    onClick={() => handleDeleteDay(index)}
                    title="Удалить все занятия этого дня"
                    className={`ml-auto p-1.5 rounded-lg border transition ${
                      index === currentDayIndex
                        ? 'border-white/50 text-white hover:bg-white/10'
                        : 'border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400'
                    }`}
                  >
                    <FiTrash size={14} />
                  </button>
                )}
              </div>
              <div className={index === currentDayIndex ? 'bg-white' : ''}>
                {groupedSchedules[index]?.length > 0 ? (
                  groupedSchedules[index].map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 relative group"
                    >
                      <div className="flex-shrink-0 text-center min-w-[52px]">
                        <p className="text-xs font-semibold text-blue-600">{schedule.start_time}</p>
                        <p className="text-xs text-gray-400">{schedule.end_time}</p>
                      </div>
                      <div className="w-px self-stretch bg-blue-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{schedule.subject}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {schedule.classroom && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Ауд. {schedule.classroom}
                            </span>
                          )}
                          {schedule.teacher_name && (
                            <span className="text-xs text-gray-500">{schedule.teacher_name}</span>
                          )}
                          {schedule.subgroup && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Подгр. {schedule.subgroup}
                            </span>
                          )}
                          {schedule.week_type && schedule.week_type !== 'both' && (
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${weekTypeLabel[schedule.week_type]?.cls}`}>
                              {weekTypeLabel[schedule.week_type]?.text}
                            </span>
                          )}
                        </div>
                      </div>
                      {isEditing && canEdit && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                          >
                            <FiTrash size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 px-4 py-3">Нет занятий</p>
                )}
              </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Редактировать расписание</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Предмет</label>
                <input
                  type="text"
                  name="subject"
                  value={editFormData.subject}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время начала</label>
                <input
                  type="time"
                  name="start_time"
                  value={editFormData.start_time}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время окончания</label>
                <input
                  type="time"
                  name="end_time"
                  value={editFormData.end_time}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Аудитория</label>
                <input
                  type="text"
                  name="classroom"
                  value={editFormData.classroom}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Преподаватель</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={editFormData.teacher_name}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Подгруппа</label>
                <input
                  type="number"
                  name="subgroup"
                  value={editFormData.subgroup}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Тип недели</label>
                <select
                  name="week_type"
                  value={editFormData.week_type}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
              <h3 className="text-lg font-semibold">Добавить расписание</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Предмет</label>
                <input
                  type="text"
                  name="subject"
                  value={addFormData.subject}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время начала</label>
                <input
                  type="time"
                  name="start_time"
                  value={addFormData.start_time}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Время окончания</label>
                <input
                  type="time"
                  name="end_time"
                  value={addFormData.end_time}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Аудитория</label>
                <input
                  type="text"
                  name="classroom"
                  value={addFormData.classroom}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Преподаватель</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={addFormData.teacher_name}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Подгруппа</label>
                <input
                  type="number"
                  name="subgroup"
                  value={addFormData.subgroup}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">День недели</label>
                <select
                  name="day_of_week"
                  value={addFormData.day_of_week}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {days[num - 1]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Тип недели</label>
                <select
                  name="week_type"
                  value={addFormData.week_type}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
          <div className="bg-white p-6 rounded-xl max-w-sm w-full mx-4">
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
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Day Confirmation Modal (двойное подтверждение) */}
      {deleteDayModalOpen && dayToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full mx-4">
            {deleteDayStep === 1 ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Удалить день целиком?</h3>
                <p className="text-gray-600 mb-6">
                  Будут удалены все занятия дня{' '}
                  <span className="font-medium text-gray-800">«{dayToDelete.day}»</span>
                  {' '}({dayToDelete.lessons.length}{' '}
                  {dayToDelete.lessons.length === 1 ? 'занятие' : 'занятий'}).
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelDeleteDay}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => setDeleteDayStep(2)}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm"
                  >
                    Продолжить
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4 text-red-600">Это действие нельзя отменить</h3>
                <p className="text-gray-600 mb-6">
                  Подтвердите окончательное удаление {dayToDelete.lessons.length}{' '}
                  {dayToDelete.lessons.length === 1 ? 'занятия' : 'занятий'} из дня «{dayToDelete.day}».
                </p>
                {deleteDayError && (
                  <p className="text-red-500 text-sm mb-4">{deleteDayError}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelDeleteDay}
                    disabled={deletingDay}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm disabled:opacity-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={confirmDeleteDay}
                    disabled={deletingDay}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
                  >
                    {deletingDay ? 'Удаление...' : 'Да, удалить всё'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulePage;