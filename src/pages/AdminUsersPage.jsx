import { useState, useEffect } from 'react';
import { usersAPI } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';
import { FiEdit, FiPlus, FiTrash, FiX, FiSearch } from 'react-icons/fi';

function AdminUsersPage() {
  const { user } = useAuth();
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
    full_name: '',
    group_number: '',
    subgroup: '',
    department: '',
  });
  const [editFormData, setEditFormData] = useState({
    username: '',
    telegram_id: '',
    role: '',
    full_name: '',
    group_number: '',
    subgroup: '',
    department: '',
  });
  const [addFormError, setAddFormError] = useState('');
  const [editFormError, setEditFormError] = useState('');

  const groups = ['', 'ИБ-11БО','ИБ-21БО','ИБ-31БО','ИБ-41БО','КБ-11СО','КБ-21СО','КБ-31СО','КБ-41СО','КБ-51СО','МКН-11БО','МКН-21БО','МКН-31БО','МКН-41БО','ПМИ-11БО','ПМИ-12БО','ПМИ-13БО','ПМИ-21БО','ПМИ-22БО','ПМИ-23БО','ПМИ-31БО','ПМИ-32БО','ПМИ-33БО','ПМИ-41БО','ПМИ-42БО','ПМИ-43БО','ПМИ-11МО','МКН-11МО','ИБМ-11МО'];
  const roles = ['admin', 'teacher', 'group_leader', 'student'];

  useEffect(() => {
    fetchUsers();
  }, [selectedGroup]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usersAPI.getAll(null, selectedGroup);
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
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(query.toLowerCase()))
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
      full_name: '',
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
      full_name: user.full_name || '',
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
      const newUser = {
        username: addFormData.username,
        password: addFormData.password,
        telegram_id: parseInt(addFormData.telegram_id),
        role: addFormData.role,
        full_name: addFormData.full_name || null,
        group_number: addFormData.group_number || null,
        subgroup: addFormData.subgroup ? parseInt(addFormData.subgroup) : null,
        department: addFormData.department || null,
        notification_settings: JSON.stringify({ event_reminder: -1 }),
      };
      await usersAPI.create(newUser);
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
      const updatedUser = {
        username: editFormData.username,
        telegram_id: parseInt(editFormData.telegram_id),
        role: editFormData.role,
        full_name: editFormData.full_name || null,
        group_number: editFormData.group_number || null,
        subgroup: editFormData.subgroup ? parseInt(editFormData.subgroup) : null,
        department: editFormData.department || null,
      };
      await usersAPI.update(selectedUser.id, updatedUser);
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
        await usersAPI.delete(userToDelete.id);
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

  const roleBadge = {
    admin:        { text: 'Администратор', cls: 'bg-red-100 text-red-700' },
    teacher:      { text: 'Преподаватель', cls: 'bg-blue-100 text-blue-700' },
    group_leader: { text: 'Староста', cls: 'bg-purple-100 text-purple-700' },
    student:      { text: 'Студент', cls: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Пользователи</h2>
        {user?.role === 'admin' && (
          <button
            onClick={handleEditToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              isEditing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? <><FiX size={16} /> Готово</> : <><FiEdit size={16} /> Управление</>}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {groups.map((group) => (
            <option key={group} value={group}>{group || 'Все группы'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-lg shadow-sm">Пользователи не найдены</div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => {
            const initials = (user.full_name || user.username).split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-800 text-sm">{user.full_name || user.username}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role]?.cls || 'bg-gray-100 text-gray-600'}`}>
                      {roleBadge[user.role]?.text || user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {user.group_number && <span className="text-xs text-gray-500">{user.group_number}{user.subgroup ? ` / подгр. ${user.subgroup}` : ''}</span>}
                    {user.department && <span className="text-xs text-gray-500">{user.department}</span>}
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEditUser(user)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition">
                      <FiEdit size={14} />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                      <FiTrash size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Добавить пользователя</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Имя пользователя</label>
                <input
                  type="text"
                  name="username"
                  value={addFormData.username}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
                <input
                  type="password"
                  name="password"
                  value={addFormData.password}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telegram ID</label>
                <input
                  type="number"
                  name="telegram_id"
                  value={addFormData.telegram_id}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Роль</label>
                <select
                  name="role"
                  value={addFormData.role}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Полное имя</label>
                <input
                  type="text"
                  name="full_name"
                  value={addFormData.full_name}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Группа</label>
                <select
                  name="group_number"
                  value={addFormData.group_number}
                  onChange={handleAddFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="">Нет группы</option>
                  {groups.slice(1).map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Кафедра</label>
                <input
                  type="text"
                  name="department"
                  value={addFormData.department}
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

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Редактировать пользователя</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Имя пользователя</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telegram ID</label>
                <input
                  type="number"
                  name="telegram_id"
                  value={editFormData.telegram_id}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Роль</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Полное имя</label>
                <input
                  type="text"
                  name="full_name"
                  value={editFormData.full_name}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Группа</label>
                <select
                  name="group_number"
                  value={editFormData.group_number}
                  onChange={handleEditFormChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option value="">Нет группы</option>
                  {groups.slice(1).map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Кафедра</label>
                <input
                  type="text"
                  name="department"
                  value={editFormData.department}
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
            <p className="mb-4">Вы уверены, что хотите удалить пользователя "<strong>{userToDelete?.username}</strong>"?</p>
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

      {/* Self-Deletion Warning Modal */}
      {selfDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ошибка</h3>
              <button
                onClick={closeSelfDeleteModal}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="mb-4">Вы не можете удалить самого себя.</p>
            <div className="flex justify-end">
              <button
                onClick={closeSelfDeleteModal}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm"
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