import { NavLink, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCalendar, FiBell, FiUser, FiUsers, FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const roleLabels = {
  admin:        'Администратор',
  teacher:      'Преподаватель',
  group_leader: 'Лидер группы',
  student:      'Студент',
};

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const handleNavClick = () => onClose();

  const displayName = user?.full_name || user?.username || '';
  const initials = displayName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  const navItems = [
    { to: '/',           icon: <FiCalendar size={18} />,      label: 'Расписание',   end: true },
    { to: '/events',     icon: <FiBell size={18} />,          label: 'События' },
    { to: '/chats',      icon: <FiMessageSquare size={18} />, label: 'Чаты' },
    ...(user?.role === 'admin'
      ? [{ to: '/admin/users', icon: <FiUsers size={18} />, label: 'Пользователи' }]
      : []),
    { to: '/profile',    icon: <FiUser size={18} />,          label: 'Профиль' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/40">
            <FiCalendar size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-none">ScheduleHelper</p>
            <p className="text-slate-500 text-xs mt-0.5">Помощник расписания</p>
          </div>
          {/* Стрелка свернуть — только мобилки */}
          <button
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex-shrink-0"
            onClick={onClose}
            aria-label="Свернуть меню"
          >
            <FiChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="flex-shrink-0">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{displayName}</p>
              <p className="text-slate-500 text-xs truncate">{roleLabels[user?.role] || user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-700 flex-shrink-0"
              title="Выйти"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-30"
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;
