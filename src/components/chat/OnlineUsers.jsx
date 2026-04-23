import React from 'react';

const OnlineUsers = ({ users = [] }) => {
  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
      <p className="text-xs font-semibold text-gray-600 mb-2">Online ({users.length})</p>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center gap-1 px-2 py-1 bg-white border border-green-200 rounded-full text-sm text-gray-700"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{user.full_name || user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
