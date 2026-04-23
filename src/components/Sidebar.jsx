import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiCalendar, FiBell, FiUser, FiUsers, FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600">ScheduleHelper</h2>
          <p className="text-xs text-gray-500 mt-1">Помощник расписания</p>
        </div>
        <nav className="mt-4 space-y-1">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition rounded-none"
            onClick={handleNavClick}
          >
            <FiCalendar className="mr-3" size={20} /> Расписание
          </Link>
          <Link
            to="/events"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            onClick={handleNavClick}
          >
            <FiBell className="mr-3" size={20} /> События
          </Link>
          <Link
            to="/chats"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            onClick={handleNavClick}
          >
            <FiMessageSquare className="mr-3" size={20} /> Чаты
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin/users"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
              onClick={handleNavClick}
            >
              <FiUsers className="mr-3" size={20} /> Управление пользователями
            </Link>
          )}
          <Link
            to="/profile"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            onClick={handleNavClick}
          >
            <FiUser className="mr-3" size={20} /> Профиль
          </Link>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-800">{user?.full_name || user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role_display || user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
          >
            <FiLogOut className="mr-2" size={18} /> Выйти
          </button>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;