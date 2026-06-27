import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/endpoints';
import { FiCalendar, FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const FACTS = [
  'Студенты, которые регулярно проверяют расписание заранее, успевают на 23% больше дел за день.',
  'Эффект Зейгарник: незавершённые задачи запоминаются лучше завершённых — поэтому так сложно «выключить» голову перед экзаменом.',
  'Исследования NASA показали, что 26-минутный сон повышает продуктивность на 34% и внимательность на 54%.',
  'Первый в мире университет — Болонский — основан в 1088 году. Ему уже почти 1000 лет.',
  'Средний студент проводит около 900 часов в учебных аудиториях за год — это больше месяца без сна.',
  'Мозг лучше запоминает информацию, если её повторять через 1 день, 1 неделю и 1 месяц после первого изучения.',
  'В Японии «ikigai» — смысл жизни — часто связан с расписанием: чёткая структура дня снижает тревожность.',
  'Феномен «дедлайн-прокрастинация» описан ещё в 1955 году Паркинсоном: работа заполняет ровно столько времени, сколько на неё отведено.',
  'Метод Помодоро (25 мин работы + 5 мин отдыха) придумал Франческо Чирилло в конце 1980-х, используя кухонный таймер в форме помидора.',
  'Шрифт Inter, которым написан этот текст, разработан Расмусом Андерссоном и оптимизирован специально для экранов.',
  'Человек принимает в среднем 35 000 решений в день — большинство из них неосознанно.',
  'Написание конспектов от руки улучшает усвоение материала на 40% по сравнению с печатью — мозг «думает» во время письма.',
  'В среднем требуется 66 дней, чтобы новое поведение стало привычкой — не 21, как принято считать.',
  'Калифорнийский университет выяснил: после отвлечения нужно в среднем 23 минуты, чтобы вернуться к полной концентрации.',
  'Музыка без слов (ambient, lo-fi) повышает концентрацию при учёбе — слова конкурируют с речевыми центрами мозга.',
];


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState(null);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FACTS.length));
  const [factVisible, setFactVisible] = useState(true);
  const intervalRef = useRef(null);
  const { login, error, clearError, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Авто-вход через Telegram WebApp
  useEffect(() => {
    const tryTelegramLogin = async () => {
      if (!window.Telegram?.WebApp) return;
      window.Telegram.WebApp.ready();
      const initData = window.Telegram.WebApp.initData;
      if (!initData) return;

      setTelegramLoading(true);
      try {
        const tokenRes = await authAPI.telegramLogin(initData);
        const { access_token, refresh_token } = tokenRes.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        const userRes = await authAPI.getMe();
        setUser(userRes.data);
        navigate('/');
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = detail?.includes('не зарегистрирован')
          ? 'Аккаунт не привязан к Telegram. Войдите через логин и пароль — Telegram привяжется автоматически.'
          : (detail || 'Ошибка авторизации через Telegram');
        setTelegramError(msg);
        setTelegramLoading(false);
      }
    };

    tryTelegramLogin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      clearError();
      const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null;
      await login(username, password, tgId);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Полноэкранный спиннер пока идёт авто-вход через Telegram
  if (telegramLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="text-center text-white">
          <div className="h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto mb-4" />
          <p className="font-semibold text-lg">Входим через Telegram...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <FiCalendar size={20} />
          </div>
          <span className="font-semibold text-lg">ScheduleHelper</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Расписание<br />всегда под рукой
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Управляйте расписанием занятий, следите за событиями и общайтесь с однокурсниками.
          </p>

          <div className="mt-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-3">
              Знаешь ли ты...
            </p>
            <p
              className="text-white/90 text-sm leading-relaxed transition-opacity duration-300"
              style={{ opacity: factVisible ? 1 : 0 }}
            >
              {FACTS[factIndex]}
            </p>
            <div className="flex gap-1 mt-4">
              {FACTS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === factIndex ? 'bg-white w-4' : 'bg-white/30 w-1'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-blue-300 text-xs">© 2025 ScheduleHelper</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FiCalendar size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">ScheduleHelper</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Войти в аккаунт</h2>
          <p className="text-slate-500 text-sm mb-8">Введите ваши данные для входа</p>

          {(error || telegramError) && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{telegramError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Имя пользователя
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="Введите имя пользователя"
                  maxLength={100}
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="Введите пароль"
                  maxLength={255}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Входим...
                </>
              ) : 'Войти'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
