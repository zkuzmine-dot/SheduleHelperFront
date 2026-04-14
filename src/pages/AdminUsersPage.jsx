import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FiEdit, FiPlus, FiTrash, FiX, FiSearch } from 'react-icons/fi';

function AdminUsersPage() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selfDeleteModalOpen, setSelfDeleteModalOpen] = useState(false); // New state for self-deletion modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addFormData, setAddFormData] = useState({
    username: '',
    password: '',
    telegram_id: '',
    role: 'student',
    group_number: '',
    subgroup: '',
    department: '',
  });
  const [editFormData, setEditFormData] = useState({
    username: '',
    telegram_id: '',
    role: '',
    group_number: '',
    subgroup: '',
    department: '',
  });
  const [addFormError, setAddFormError] = useState('');
  const [editFormError, setEditFormError] = useState('');

  const groups = ['', 'ИБ-11БО','ИБ-21БО','ИБ-31БО','ИБ-41БО','КБ-11СО','КБ-21СО','КБ-31СО','КБ-41СО','КБ-51СО','МКН-11БО','MKH-21БО','MKH-31БО','MKH-41БО','ПМИ-11БО','ПМИ-12БО','ПМИ-13БО','ПМИ-21БО','ПМИ-22БО','ПМИ-23БО','ПМИ-31БО','ПМИ-32БО','ПМИ-33БО','ПМИ-41БО','ПМИ-42БО','ПМИ-43БО','ПМИ-11МО','МКН-11МО','ИБМ-11МО'];
  const roles = ['admin', 'teacher', 'group_leader', 'student'];

  useEffect(() => {
    fetchUsers();
  }, [selectedGroup]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedGroup) params.group_number = selectedGroup;
      const response = await axios.get('https://theschedulehelper.hps-2.ru/users/', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setUsers(response.data);
      filterUsers(response.data, searchQuery);
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (usersList, query) => {
    const filtered = usersList.filter((u) =>
      u.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterUsers(users, query);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleAddUser = () => {
    setAddFormData({
      username: '',
      password: '',
      telegram_id: '',
      role: 'student',
      group_number: '',
      subgroup: '',
      department: '',
    });
    setAddFormError('');
    setAddModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      telegram_id: user.telegram_id.toString(),
      role: user.role,
      group_number: user.group_number || '',
      subgroup: user.subgroup ? user.subgroup.toString() : '',
      department: user.department || '',
    });
    setEditFormError('');
    setEditModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (user?.id === userId) {
      setSelfDeleteModalOpen(true); // Open self-deletion warning modal
      return;
    }
    setUserToDelete({ id: userId, username: userToDelete.username });
    setDeleteModalOpen(true);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddForm = () => {
    if (!addFormData.username.trim()) return 'Имя пользователя обязательно';
    if (!addFormData.password.trim()) return 'Пароль обязателен';
    if (!addFormData.telegram_id || isNaN(parseInt(addFormData.telegram_id))) return 'Telegram ID должен быть числом';
    if (!roles.includes(addFormData.role)) return 'Неверная роль';
    if (addFormData.subgroup && (isNaN(parseInt(addFormData.subgroup)) || parseInt(addFormData.subgroup) < 1)) return 'Подгруппа должна быть положительным числом';
    return '';
  };

  const validateEditForm = () => {
    if (!editFormData.username.trim()) return 'Имя пользователя обязательно';
    if (!editFormData.telegram_id || isNaN(parseInt(editFormData.telegram_id))) return 'Telegram ID должен быть числом';
    if (!roles.includes(editFormData.role)) return 'Неверная роль';
    if (editFormData.subgroup && (isNaN(parseInt(editFormData.subgroup)) || parseInt(editFormData.subgroup) < 1)) return 'Подгруппа должна быть положительным числом';
    return '';
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateAddForm();
    if (validationError) {
      setAddFormError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newUser = {
        username: addFormData.username,
        password: addFormData.password,
        telegram_id: parseInt(addFormData.telegram_id),
        role: addFormData.role,
        group_number: addFormData.group_number || null,
        subgroup: addFormData.subgroup ? parseInt(addFormData.subgroup) : null,
        department: addFormData.department || null,
        notification_settings: JSON.stringify({ event_reminder: -1 }),
      };
      await axios.post('https://theschedulehelper.hps-2.ru/users/', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddModalOpen(false);
      setAddFormError('');
      fetchUsers();
    } catch (err) {
      console.error('Ошибка добавления пользователя:', err);
      setAddFormError(err.response?.data?.detail || 'Не удалось добавить пользователя');
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateEditForm();
    if (validationError) {
      setEditFormError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updatedUser = {
        username: editFormData.username,
        telegram_id: parseInt(editFormData.telegram_id),
        role: editFormData.role,
        group_number: editFormData.group_number || null,
        subgroup: editFormData.subgroup ? parseInt(editFormData.subgroup) : null,
        department: editFormData.department || null,
      };
      await axios.put(`https://theschedulehelper.hps-2.ru/users/${selectedUser.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditModalOpen(false);
      setEditFormError('');
      fetchUsers();
    } catch (err) {
      console.error('Ошибка обновления пользователя:', err);
      setEditFormError(err.response?.data?.detail || 'Не удалось обновить пользователя');
    }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://theschedulehelper.hps-2.ru/users/${userToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        console.error('Ошибка удаления пользователя:', err);
        setError('Не удалось удалить пользователя');
      } finally {
        setDeleteModalOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const closeSelfDeleteModal = () => {
    setSelfDeleteModalOpen(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl font-bold text-blue-600">Управление пользователями</h2>
        {user?.role === 'admin' && (
          <button
            onClick={handleEditToggle}
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            {isEditing ? <FiX size={20} /> : <FiEdit size={20} />}
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-2 mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени пользователя..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group || 'Все группы'}
            </option>
          ))}
        </select>
      </div>

      {/* Users List */}
      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">Пользователи не найдены</p>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-lg shadow-md bg-white relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">Роль: {user.role}</p>
                  {user.group_number && (
                    <p className="text-sm text-gray-600">Группа: {user.group_number}</p>
                  )}
                  {user.subgroup && (
                    <p className="text-sm text-gray-600">Подгруппа: {user.subgroup}</p>
                  )}
                  {user.department && (
                    <p className="text-sm text-gray-600">Кафедра: {user.department}</p>
                  )}
                  <p className="text-sm text-gray-600">Telegram ID: {user.telegram_id}</p>
                  <p className="text-sm text-gray-600">Создан: {user.created_at}</p>
                  {user.last_login && (
                    <p className="text-sm text-gray-600">Последний вход: {user.last_login}</p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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

      {/* Add User Button */}
      {isEditing && (
        <button
          onClick={handleAddUser}
          className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg"
        >
          <FiPlus size={24} />
        </button>
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Добавить пользователя</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Имя пользователя</label>
                <input
                  type="text"
                  name="username"
                  value={addFormData.username}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Пароль</label>
                <input
                  type="password"
                  name="password"
                  value={addFormData.password}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telegram ID</label>
                <input
                  type="number"
                  name="telegram_id"
                  value={addFormData.telegram_id}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Роль</label>
                <select
                  name="role"
                  value={addFormData.role}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Группа</label>
                <select
                  name="group_number"
                  value={addFormData.group_number}
                  onChange={handleAddFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Нет группы</option>
                  {groups.slice(1).map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700">Кафедра</label>
                <input
                  type="text"
                  name="department"
                  value={addFormData.department}
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

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Редактировать пользователя</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Имя пользователя</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telegram ID</label>
                <input
                  type="number"
                  name="telegram_id"
                  value={editFormData.telegram_id}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Роль</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Группа</label>
                <select
                  name="group_number"
                  value={editFormData.group_number}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Нет группы</option>
                  {groups.slice(1).map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700">Кафедра</label>
                <input
                  type="text"
                  name="department"
                  value={editFormData.department}
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
            <p className="mb-4">Вы уверены, что хотите удалить пользователя "<strong>{userToDelete?.username}</strong>"?</p>
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

      {/* Self-Deletion Warning Modal */}
      {selfDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ошибка</h3>
              <button
                onClick={closeSelfDeleteModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="mb-4">Вы не можете удалить самого себя.</p>
            <div className="flex justify-end">
              <button
                onClick={closeSelfDeleteModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;