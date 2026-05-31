import React from 'react';

const OnlineUsers = ({ users = [] }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
      <span className="text-xs text-slate-400 flex-shrink-0">В сети:</span>
      <div className="flex gap-1.5">
        {users.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full text-xs text-green-700 font-medium flex-shrink-0"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {user.full_name || user.username}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
