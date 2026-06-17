import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const OnlineUsers = ({ users = [] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!users || users.length === 0) return null;

  // До 2 человек — показываем пилюлями сразу, без сворачивания
  if (users.length <= 2) {
    return (
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-slate-400 flex-shrink-0">В сети:</span>
        <div className="flex gap-1.5">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full text-xs text-green-700 font-medium flex-shrink-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {u.full_name || u.username}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Больше 2 — сворачиваем в кнопку-счётчик
  return (
    <div className="bg-white border-b border-slate-100">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50 transition"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-xs text-green-700 font-medium">{users.length} в сети</span>
        {expanded ? (
          <FiChevronUp size={14} className="text-slate-400 ml-auto" />
        ) : (
          <FiChevronDown size={14} className="text-slate-400 ml-auto" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full text-xs text-green-700 font-medium"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {u.full_name || u.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;
