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

  return (
    <div className="p-4 max-w-md mx-auto relative">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}

      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Профиль</h2>
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Имя пользователя</label>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800">
            {user.username}
          </div>
        </div>
        {user.full_name && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800">
              {user.full_name}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Группа</label>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800">
            {user.group_number || 'Не указана'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800">
            {user.role === 'admin' ? 'Администратор' : user.role === 'teacher' ? 'Преподаватель' : user.role === 'group_leader' ? 'Лидер группы' : 'Студент'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Создан</label>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 text-sm">
            {user.created_at && new Date(user.created_at).toLocaleString('ru-RU')}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
        >
          Изменить пароль
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                className="text-gray-600 hover:text-gray-800"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
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