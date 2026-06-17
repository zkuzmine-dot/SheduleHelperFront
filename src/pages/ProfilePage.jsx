import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiEdit, FiX } from 'react-icons/fi';

function ProfilePage() {
  const { user, changePassword } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (!user) {
      setError('Данные пользователя недоступны');
    }
  }, [user]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Все поля обязательны для заполнения');
      setLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError('Новый пароль должен отличаться от текущего');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Новые пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setIsModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showNotification('Пароль успешно изменён');
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-center mt-8">Загрузка...</p>;
  }

  const roleLabel = {
    admin: { text: 'Администратор', cls: 'bg-red-100 text-red-700' },
    teacher: { text: 'Преподаватель', cls: 'bg-blue-100 text-blue-700' },
    group_leader: { text: 'Староста', cls: 'bg-purple-100 text-purple-700' },
    student: { text: 'Студент', cls: 'bg-green-100 text-green-700' },
  };
  const displayName = user.full_name || user.username;
  const initials = displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto relative">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Профиль</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">{displayName}</p>
            <p className="text-blue-100 text-sm">@{user.username}</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Роль</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleLabel[user.role]?.cls || 'bg-gray-100 text-gray-600'}`}>
              {roleLabel[user.role]?.text || user.role}
            </span>
          </div>
          {user.group_number && (
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Группа</span>
              <span className="text-sm font-medium text-gray-800">{user.group_number}</span>
            </div>
          )}
          {user.department && (
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Кафедра</span>
              <span className="text-sm font-medium text-gray-800">{user.department}</span>
            </div>
          )}
          {user.created_at && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Дата регистрации</span>
              <span className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Изменить пароль
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Смена пароля</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердить новый пароль</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                  disabled={loading}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;