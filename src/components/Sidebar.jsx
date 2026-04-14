import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiCalendar, FiBell, FiUser, FiUsers } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-blue-600 text-right lg:text-left">Schedule Helper</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100"
            onClick={() => setIsOpen(false)}
          >
            <FiCalendar className="mr-2" /> Расписание
          </Link>
          <Link
            to="/events"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100"
            onClick={() => setIsOpen(false)}
          >
            <FiBell className="mr-2" /> События
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin/users"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100"
              onClick={() => setIsOpen(false)}
            >
              <FiUsers className="mr-2" /> Управление пользователями
            </Link>
          )}
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-100"
            onClick={() => setIsOpen(false)}
          >
            <FiUser className="mr-2" /> Профиль
          </Link>
        </nav>
        <div className="absolute bottom-4 px-4">
          <p className="text-gray-600">{user?.username}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-red-600 hover:underline"
          >
            Выйти
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